const express = require("express");
const {
    default: makeWASocket,
    useMultiFileAuthState,
} = require("@whiskeysockets/baileys");
const qrcode = require("qrcode");
const fs = require("fs");

const app = express();
app.use(express.static("public"));

app.get("/generate", async (req, res) => {
    const number = req.query.number;
    const sessionFolder = `./sessions/${number}`;

    if (!fs.existsSync("sessions")) fs.mkdirSync("sessions");

    const { state, saveCreds } = await useMultiFileAuthState(sessionFolder);
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.once("connection.update", async ({ qr }) => {
        if (qr) {
            const qrCode = await qrcode.toDataURL(qr);
            return res.json({ qr: qrCode });
        }
    });

    // When session is completed
    sock.ev.on("connection.update", ({ connection }) => {
        if (connection === "open") {
            res.json({
                sessionReady: true,
                qr: null
            });
        }
    });
});

app.get("/download", (req, res) => {
    const number = req.query.number;
    const folder = `./sessions/${number}`;

    if (!fs.existsSync(folder)) return res.send("No session exists!");

    const zipName = `${number}-session.zip`;

    const { exec } = require("child_process");
    exec(`zip -r ${zipName} ${folder}`, () => {
        res.download(zipName, () => {
            fs.unlinkSync(zipName);
        });
    });
});

app.listen(3000, () => console.log("MRVIRUSX SESSION SERVER RUNNING"));