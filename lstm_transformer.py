import torch
import torch.nn as nn


class LSTMTransformer(nn.Module):

    def __init__(
        self,
        input_dim=512,
        lstm_hidden=256,
        lstm_layers=2,
        transformer_heads=8,
        transformer_layers=2,
        transformer_dim=512,
        dropout=0.2,
        num_classes=2
    ):
        super().__init__()

        # ==========================================
        # 1. Input Projection
        # ==========================================

        self.input_projection = nn.Linear(
            input_dim,
            lstm_hidden
        )

        # ==========================================
        # 2. LSTM
        # ==========================================

        self.lstm = nn.LSTM(
            input_size=lstm_hidden,
            hidden_size=lstm_hidden,
            num_layers=lstm_layers,
            batch_first=True,
            dropout=dropout if lstm_layers > 1 else 0,
            bidirectional=True
        )

        # BiLSTM output dimension
        lstm_output_dim = lstm_hidden * 2

        # ==========================================
        # 3. Transformer Projection
        # ==========================================

        self.transformer_projection = nn.Linear(
            lstm_output_dim,
            transformer_dim
        )

        # ==========================================
        # 4. Positional Encoding
        # ==========================================

        self.positional_encoding = PositionalEncoding(
            d_model=transformer_dim,
            max_len=500
        )

        # ==========================================
        # 5. Transformer Encoder
        # ==========================================

        encoder_layer = nn.TransformerEncoderLayer(
            d_model=transformer_dim,
            nhead=transformer_heads,
            dim_feedforward=transformer_dim * 2,
            dropout=dropout,
            activation="gelu",
            batch_first=True,
            norm_first=True
        )

        self.transformer = nn.TransformerEncoder(
            encoder_layer,
            num_layers=transformer_layers
        )

        # ==========================================
        # 6. Classification Head
        # ==========================================

        self.classifier = nn.Sequential(

            nn.Linear(
                transformer_dim,
                256
            ),

            nn.GELU(),

            nn.Dropout(dropout),

            nn.Linear(
                256,
                128
            ),

            nn.GELU(),

            nn.Dropout(dropout),

            nn.Linear(
                128,
                num_classes
            )
        )

    def forward(self, x):

        # x:
        # [batch, sequence_length, input_dim]

        # Example:
        # [32, 16, 512]

        # ==========================================
        # Input Projection
        # ==========================================

        x = self.input_projection(x)

        # [B, T, 256]

        # ==========================================
        # LSTM
        # ==========================================

        x, _ = self.lstm(x)

        # BiLSTM:
        # [B, T, 512]

        # ==========================================
        # Transformer Projection
        # ==========================================

        x = self.transformer_projection(x)

        # [B, T, 512]

        # ==========================================
        # Positional Encoding
        # ==========================================

        x = self.positional_encoding(x)

        # ==========================================
        # Transformer
        # ==========================================

        x = self.transformer(x)

        # [B, T, 512]

        # ==========================================
        # Temporal Pooling
        # ==========================================

        x = x.mean(dim=1)

        # [B, 512]

        # ==========================================
        # Classification
        # ==========================================

        output = self.classifier(x)

        return output


class PositionalEncoding(nn.Module):

    def __init__(
        self,
        d_model,
        max_len=500
    ):
        super().__init__()

        pe = torch.zeros(
            max_len,
            d_model
        )

        position = torch.arange(
            0,
            max_len,
            dtype=torch.float
        ).unsqueeze(1)

        div_term = torch.exp(
            torch.arange(
                0,
                d_model,
                2
            ).float()
            * (
                -torch.log(
                    torch.tensor(10000.0)
                )
                / d_model
            )
        )

        pe[:, 0::2] = torch.sin(
            position * div_term
        )

        pe[:, 1::2] = torch.cos(
            position * div_term
        )

        pe = pe.unsqueeze(0)

        self.register_buffer(
            "pe",
            pe
        )

    def forward(self, x):

        return x + self.pe[
            :, :x.size(1), :
        ]