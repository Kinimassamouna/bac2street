const QRCode = require('qrcode');
const Jimp = require('jimp');
const path = require('path');

// Récupérer le gameCode depuis la ligne de commande
// Exemple : node generateQR.js ABCDEF
const gameCode = process.argv[2];
if (!gameCode) {
  console.error("❌ Veuillez fournir un gameCode. Ex: node generateQR.js ABCDEF");
  process.exit(1);
}

// Construire l'URL dynamique de la partie
const url = `${process.env.FRONTEND_URL || 'https://Kinimassamouna.github.io/bac2street'}/join-game/${gameCode}`;

(async () => {
  try {
    // Générer le QR code en buffer
    const buffer = await QRCode.toBuffer(url, {
      width: 400,
      color: { dark: '#FF00FF', light: '#FFFF00' }
    });

    // Charger le QR code en image
    const qrImage = await Jimp.read(buffer);

    // Charger le logo
    const logoPath = path.join(__dirname, 'public', 'Assets', 'Images', 'Game.png');
    const logo = await Jimp.read(logoPath);
    logo.resize(80, 80);

    // Centrer le logo sur le QR
    const x = (qrImage.bitmap.width / 2) - (logo.bitmap.width / 2);
    const y = (qrImage.bitmap.height / 2) - (logo.bitmap.height / 2);
    qrImage.composite(logo, x, y);

    // Sauvegarder le QR code final
    const outputPath = path.join(__dirname, `qr-${gameCode}.png`);
    await qrImage.writeAsync(outputPath);

    console.log(`✅ QR Code avec logo généré pour la partie ${gameCode} :`, outputPath);
  } catch (err) {
    console.error("🔥 Erreur lors de la génération du QR code :", err);
  }
})();
