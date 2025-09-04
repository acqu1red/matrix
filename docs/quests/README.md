# Simple instructions to run the "Influence Empire" quest.

## How to Run

1.  **Local Server (Recommended)**:
    *   You need a simple local web server to run this project because it uses `fetch()` to load the `game.json` file, which most browsers block for local `file://` URLs due to security policies.
    *   If you have Python installed, the easiest way is to navigate to the `docs/quests/` directory in your terminal and run:
        ```sh
        # For Python 3
        python -m http.server
        ```
    *   Then, open your web browser and go to `http://localhost:8000/imperial.html`.

2.  **Directly (Might not work)**:
    *   You can try opening the `docs/quests/imperial.html` file directly in your browser.
    *   If you see a blank screen or errors in the developer console related to "CORS policy" or "cross-origin requests", you must use the local server method above.

## Telegram Integration Notes

*   The game is built to work inside a Telegram Web App.
*   It automatically tries to initialize the Telegram WebApp API (`window.Telegram.WebApp`).
*   **Theme Adaptation**: The game will attempt to read your Telegram theme (dark/light) and adjust its colors (`--bg`, `--text`, etc.) for a native look and feel.
*   **Main Button**: Telegram's main button is used for primary actions like starting the game, moving to the next stage, and confirming choices.
*   **Haptics**: The game is designed to use haptic feedback, which will work when opened through a Telegram client that supports it.
