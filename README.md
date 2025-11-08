# Edgar Diaz-Gutierrez | Portfolio Website 2.0

Personal portfolio website showcasing my experience as a Full-Stack Software Engineer, featuring interactive counters powered by browser localStorage.

🔗 **Live Site:** [edgar.technology](https://edgar.technology)

## Features

### 🎨 Design
- **Modern, Clean Interface** - Responsive design that works on all devices
- **Dark/Light Theme Toggle** - Persistent theme preference using localStorage
- **Smooth Animations** - Scroll-triggered animations and smooth transitions
- **Gradient Accents** - Purple/blue gradient theme throughout

### 📊 Interactive Counters
- **Click Counter** - Tracks every click on the page, persists across sessions
- **Tick Counter** - Auto-increments every second, continues from last saved value
- **Browser Storage** - Uses localStorage for persistence (per-device, per-browser)
- **Cross-Tab Sync** - Counters stay synchronized across multiple tabs
- **Reset Functionality** - Option to reset each counter independently

### 📱 Sections
- **Hero** - Introduction with call-to-action buttons
- **About** - Bio and comprehensive tech stack
- **Experience** - Timeline of career history (5 positions)
- **Projects** - Showcase of 5 key projects with GitHub links
- **Counters** - Interactive click and tick counters
- **Education** - Academic background and certifications
- **Contact** - Multiple ways to get in touch

### 🔧 Technical Features
- Pure HTML, CSS, and JavaScript (no frameworks)
- CSS Custom Properties for theming
- LocalStorage API for data persistence
- Intersection Observer for scroll animations
- Responsive design with mobile-first approach
- SEO-friendly semantic HTML

## Project Structure

```
edgarsdzgz.github.io/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # All styling with theme variables
├── js/
│   └── main.js         # JavaScript for counters, theme, navigation
├── v1/                 # Archived version 1.0 of the site
│   ├── index.html
│   ├── css/
│   └── js/
├── CNAME               # Custom domain configuration
└── README.md           # This file
```

## Technologies Used

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with custom properties, Grid, Flexbox
- **JavaScript (ES6+)** - Vanilla JS with classes and modules pattern
- **Google Fonts** - Inter font family
- **GitHub Pages** - Free hosting with custom domain

## Key Functionality

### Counter System
The counters use browser localStorage to persist data:

```javascript
// Click Counter: Increments on any page click
document.addEventListener('click', () => {
    clickCount++;
    localStorage.setItem('clickCount', clickCount);
    updateDisplay();
});

// Tick Counter: Auto-increments every second
setInterval(() => {
    tickCount++;
    localStorage.setItem('tickCount', tickCount);
    updateDisplay();
}, 1000);
```

### Theme Toggle
Respects system preferences and persists user choice:

```javascript
// Load saved theme or detect system preference
const savedTheme = localStorage.getItem('theme');
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
const theme = savedTheme || systemTheme;
```

## Browser Compatibility

- ✅ Chrome/Edge (90+)
- ✅ Firefox (88+)
- ✅ Safari (14+)
- ✅ Opera (76+)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

**Note:** Requires JavaScript and localStorage to be enabled for full functionality.

## Local Development

1. Clone the repository:
```bash
git clone https://github.com/edgarsdzgz/edgarsdzgz.github.io.git
cd edgarsdzgz.github.io
```

2. Open `index.html` in your browser or use a local server:
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (http-server)
npx http-server
```

3. Visit `http://localhost:8000` in your browser

## Deployment

This site is automatically deployed via GitHub Pages:
- Push changes to the `main` branch
- GitHub Pages automatically builds and deploys
- Custom domain configured via `CNAME` file
- HTTPS enabled by default

## Data Persistence

### LocalStorage Keys
- `edgar_tech_clickCount` - Click counter value
- `edgar_tech_tickCount` - Tick counter value
- `edgar_tech_theme` - Theme preference (light/dark)

### Data Longevity
- ✅ Persists across page reloads
- ✅ Persists across browser restarts
- ⚠️ Cleared in private/incognito mode
- ⚠️ Can be cleared by user (browser settings)
- ⚠️ Safari may delete after 7 days of inactivity

## Version History

### Version 2.0 (Current)
- Complete redesign with modern UI
- Added interactive click counter with localStorage
- Added auto-incrementing tick counter
- Improved dark/light theme toggle
- Enhanced responsive design
- Scroll animations with Intersection Observer
- Cross-tab synchronization
- [View v1](https://edgar.technology/v1/)

### Version 1.0 (Archived)
- Original portfolio design
- Two-column layout
- Basic theme toggle
- Timeline career section
- [Archived at `/v1/`](./v1/)

## Contact

**Edgar Diaz-Gutierrez**
- 📧 Email: [edgar.s.dzgz@gmail.com](mailto:edgar.s.dzgz@gmail.com)
- 📱 Phone: (619) 750-4888
- 💼 LinkedIn: [linkedin.com/in/edgar-dzgz](https://www.linkedin.com/in/edgar-dzgz/)
- 🐙 GitHub: [github.com/edgarsdzgz](https://github.com/edgarsdzgz)

## License

© 2024 Edgar Diaz-Gutierrez. All rights reserved.

This is a personal portfolio website. Feel free to draw inspiration, but please don't copy it wholesale.

---

**Built with ❤️ and vanilla JavaScript**
