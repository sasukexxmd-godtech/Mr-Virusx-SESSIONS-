document.getElementById("generate").addEventListener("click", async () => {

    let number = document.getElementById("number").value.trim();
    if (!number.startsWith("+")) return alert("Use international format with +");

    document.getElementById("loading").classList.remove("hidden");

    const res = await fetch(`/generate?number=${encodeURIComponent(number)}`);
    const data = await res.json();

    document.getElementById("loading").classList.add("hidden");

    if (data.qr) {
        document.getElementById("qrBox").classList.remove("hidden");
        document.getElementById("qrImage").src = data.qr;
    }

    if (data.sessionReady) {
        document.getElementById("download").classList.remove("hidden");
        document.getElementById("download").onclick = () => {
            window.location.href = `/download?number=${number}`;
        };
    }
});