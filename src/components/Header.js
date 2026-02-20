import React from 'react';

const Header = ({ theme, onToggleTheme }) => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';

    return (
        <header className="app-header sticky-top">
            <div className="container app-header-inner">
                <div className="app-brand">
                    <div className="app-logo-wrap">
                        <img
                            className="app-logo"
                            src={`${process.env.PUBLIC_URL}/logo-mark.svg`}
                            alt="Employee Atlas logo"
                        />
                    </div>
                    <div className="app-brand-copy">
                        <p className="app-kicker m-0">Workforce Intel Suite</p>
                        <h1 className="app-title m-0">Employee Atlas</h1>
                        <p className="app-subtitle m-0">Search, sort, and map your team in real time</p>
                    </div>
                </div>

                <div className="app-header-actions">
                    <span className="status-pill">Live Directory</span>
                    <button
                        type="button"
                        className="theme-toggle"
                        onClick={onToggleTheme}
                        aria-label={`Switch to ${nextTheme} mode`}
                    >
                        <span className="theme-toggle-icon" aria-hidden="true">
                            {theme === 'dark' ? '☀️' : '🌙'}
                        </span>
                        <span className="theme-toggle-label">{nextTheme} mode</span>
                    </button>
                </div>
            </div>
        </header>
    );
}

export default Header;
