## Influence Empire Quest

This is a self-contained mini-game built with pure HTML, CSS, and JavaScript, designed to work as a Telegram Mini App.

### How to Run

1.  **Directly**: Simply open the `docs/quests/influence-empire/index.html` file in a modern web browser (like Chrome or Safari).
2.  **Local Server**: For a more robust experience (to avoid potential CORS issues with file loading, although not strictly necessary with this setup), you can run a simple local server. If you have Python installed, navigate to the project root in your terminal and run:
    ```sh
    # For Python 3
    python -m http.server
    ```
    Then, open your browser and go to `http://localhost:8000/docs/quests/influence-empire/`.

### Telegram Integration Notes

-   The game includes the `telegram-web-app.js` script.
-   It attempts to initialize the WebApp on load (`Telegram.WebApp.ready()`).
-   It reads theme parameters from `Telegram.WebApp.themeParams` to adjust the UI colors dynamically. If you run it outside of Telegram, it will use the default dark theme.
-   Haptic feedback is implemented using `Telegram.WebApp.HapticFeedback`. This will only work when the app is running inside a Telegram client.
-   The Main Button is intended to be used for primary actions like moving to the next stage.
