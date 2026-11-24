# Note de sesiune A: agentul YouTube și desenele animate

Rezumatul unei sesiuni lungi de lucru cu Claude Code (cloud), din 5 până în 24 noiembrie 2026.
Tot ce e descris aici e salvat pe GitHub, în repo-ul `Ciocu1707/Ciocu1707`, pe branch-ul **`claude/youtube-agent-sq4wnd`**.

---

## 1. Ce am făcut, pe scurt

1. **Agentul YouTube** (cod Python), cu pull request-ul #1 deschis.
2. **Patru desene animate scurte** (~50–56 s fiecare), în stilul „Sci-Fi Sitcom Toon”, cu voci și subtitrări în română.
3. **„Tata și parola”**: un film de 6 min 36 s în trei părți.
4. **Aspectul „3D”** al desenelor, salvat ca șablon pentru clipurile noi.
5. **„Soacra și GPS-ul”**: primul clip (50 s) în aspectul 3D.

Pentru fiecare film există și thumbnail, propunere de titlu și descriere pentru YouTube (date în conversație).

---

## 2. Agentul YouTube (`youtube_agent/`)

Un program de linie de comandă, cu Claude (`claude-opus-5-5`), care:

- **rezumă videoclipuri și răspunde la întrebări** despre ele, din transcriere, cu marcaje de timp. Nu are nevoie de cheie;
- **scrie conținut pentru creatori**: titluri, descrieri, tag-uri, capitole, idei de Shorts;
- **face research pe canale și teme** prin YouTube Data API. Are nevoie de `YOUTUBE_API_KEY`;
- **urcă videoclipuri** și modifică titlul, descrierea, tag-urile, confidențialitatea sau thumbnail-ul. Are nevoie de OAuth și cere confirmare înainte de fiecare schimbare. Videoclipurile se urcă implicit private.

| Fișier | Ce e |
|---|---|
| `youtube_agent/agent.py` | conversația cu Claude (tool runner) |
| `youtube_agent/tools/` | uneltele: transcriere, Data API, publicare |
| `youtube_agent/cli.py` | linia de comandă (`youtube-agent`) |
| `tests/test_agent.py` | 19 teste, toate trec |
| `README.md` | instalare și utilizare |

**Pull request:** https://github.com/Ciocu1707/Ciocu1707/pull/1 (branch → `main`). `main` conține doar un commit gol, creat ca bază pentru pull request.

**Netestat cap-coadă:** în sesiune nu exista cheie Claude, iar youtube.com era blocat de rețeaua din cloud.

---

## 3. Desenele animate

Toate sunt făcute în întregime din cod: desen, animație, muzică și efecte sonore sintetizate. Folosesc biblioteca **Lemo-Opuscar** (plugin Claude Code), cu stilul „Sci-Fi Sitcom Toon”. Vocile sunt **Microsoft Edge TTS** în română (Emil și Alina).

| Film | Folder | Durată | Personaje | Aspect |
|---|---|---|---|---|
| „Pe așteptare” (ep. 1) | `pe-asteptare/` | 54,5 s | Doru și Ilinca | plat |
| „Telecomanda” (ep. 2) | `telecomanda/` | 50,5 s | Doru și Ilinca | plat |
| „Liftul” (ep. 3) | `liftul/` | 55,7 s | Tanti Leana și Mihai | plat |
| „Motanul Copiat” (ep. 4) | `motanul/` | 55,3 s | Bubu (motanul) și Sorin | plat |
| „Tata și parola”, partea 1: Parola | `parola/` | 2 min 08 s | Tata, Mama, Andrei, Rex | plat |
| „Tata și parola”, partea 2: Investigația | `parola2/` | 2 min 04 s | aceiași | plat |
| „Tata și parola”, partea 3: Marea resetare | `parola3/` | 2 min 24 s | aceiași | plat |
| **„Tata și parola”, filmul complet** | `parola-film/` | **6 min 36 s** | aceiași | plat |
| „Soacra și GPS-ul” | `soacra/` | 50 s | ginerele, soacra, mătușa Veta, GPS-ul | **3D** |

**În fiecare folder de film găsești:**
- `<nume>.mp4`: filmul final (1920×1080, 24 fps, volum −14 LUFS);
- `thumbnail.jpg` (1280×720) și `poster.jpg`;
- `<nume>.srt`: subtitrarea (e și scrisă pe imagine);
- `TREATMENT.md` (la primele episoade): povestea, cadrele, sunetul;
- `CREDITS`: materialele altora și licențele lor (voci Microsoft Edge TTS, fonturi Google OFL);
- codul sursă (`main.js`, `story.js`, personaje, decoruri, `music/score.py`, `mix.py`, `voice.py`) și `build.sh`, care reface filmul dintr-o comandă.

Filmul complet „Tata și parola” se obține cu `parola-film/assemble.sh`, care lipește cele trei părți. E recomprimat la ~54 MB, sub limita de 100 MB a GitHub.

**Capitolele pentru YouTube** („Tata și parola”): `00:00` Partea 1 · `02:08` Partea 2 · `04:12` Partea 3.

**Ce n-a putut fi verificat:** pronunția vocilor nu s-a verificat automat, pentru că modelul de recunoaștere vocală (Whisper) se descarcă de pe Hugging Face, care e blocat aici. Fiecare film trebuie ascultat o dată de om.

---

## 4. Aspectul 3D (`sablon-3d/`)

`sablon-3d/toon.js` este motorul de desen cu aspect „mai 3D”, aprobat **pentru clipurile noi**:
- volum pe fiecare formă conturată (lumină sus-stânga, umbră jos-dreapta, mic luciu pe formele mici);
- contururi cu ~30% mai subțiri;
- `floorShadow(x, y, rx)`: umbre moi pe podea;
- `lightPass()`: lumină caldă și colțuri ușor întunecate.

Instrucțiunile sunt în `sablon-3d/README.md`. Filmele vechi rămân în varianta plată, așa cum au fost publicate. Și în `parola/` codul are deja aspectul 3D (folosit doar pentru sample), dar videoclipul `parola-partea1.mp4` e varianta plată.

---

## 5. Setări și limitări de mediu (important pentru o sesiune nouă)

- **Mediul cloud „Youtube Agent”** are permis accesul la `speech.platform.bing.com`, necesar vocilor românești. Setarea rămâne și în sesiunile viitoare.
- **Pluginul Lemo-Opuscar** se instalează din nou în fiecare sesiune cloud nouă:
  ```
  claude plugin marketplace add lemomo-ai/lemo-opuscar
  claude plugin install lemo-opuscar@lemolab
  ```
  Apoi rulezi `setup.sh` și `setup.sh deps voice music` (biblioteca ajunge în `~/lemo-opuscar`). Calea scriptului se găsește cu `find ~/.claude/plugins -path '*lemo-opuscar/scripts/setup.sh'`. Toate scripturile din proiecte presupun `LIB=/root/lemo-opuscar`.
- **Vocile românești:** `tools/tts_ro.py` (din fiecare proiect) trimite edge-tts prin proxy-ul mediului. Rulează-l cu `SSL_CERT_FILE=/root/.ccr/ca-bundle.crt`.
- **FFmpeg:** containerul are versiunea 6, iar biblioteca cere 7 pentru `mux.sh`. Descărcarea versiunii 7 a fost blocată, așa că masterizarea se face cu `tools/master_ff6.sh`, care normalizează sunetul în doi pași, separat de imagine. `build.sh` alege singur metoda după versiunea instalată.
- **Hugging Face e blocat**, deci nu există verificare automată a pronunției (vezi mai sus).
- **Calculatorul tău (`E:\claude animation`)** nu e accesibil din cloud. Fișierele se descarcă de pe GitHub (Code → Download ZIP), din conversație, sau, pe viitor, printr-o sesiune Claude Code pornită direct pe calculator (ori prin Remote Control, dacă ți-e disponibil).

---

## 6. Ce urmează

- [ ] **Ascultă fiecare film o dată**, pentru pronunție și ritm. Spune ce replici sună ciudat și le regenerez.
- [ ] **Urcă pe YouTube** (orizontal, nu Shorts) cu titlurile, descrierile și thumbnail-urile propuse. Scoate `#shorts` din descrieri la clipurile orizontale.
- [ ] **Pull request-ul #1** (agentul YouTube): merge în `main` sau închis. Momentan conține și toate filmele. Dacă vrei să rămână doar agentul, mut filmele pe un branch separat.
- [ ] **Opțional: setează `main` ca branch implicit** în GitHub (Settings → General → Default branch).
- [ ] **Clipuri noi:** folosește `sablon-3d/` (spune în sesiunea nouă: „folosește aspectul 3D din `sablon-3d/`”). Personajele existente pot fi refolosite din folderele lor.
- [ ] **Opțional:** versiuni verticale 9:16 pentru YouTube Shorts sau TikTok; aspectul 3D aplicat și pe filmele vechi, dacă te răzgândești.
- [ ] **Opțional:** după câteva zile, exportă din YouTube Studio graficul de retenție (CSV) și îl analizăm, ca să vedem unde pleacă oamenii.
