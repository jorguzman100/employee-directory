import React from 'react';

const Header = () => {
    return (
        <header className="App-header">
            <div className="sticky-top bg-info text-white text-center py-3 display-4">
                <p><span role="img" aria-label="employee emoji">👩🏻‍💼👨🏻‍💼</span> Employee Directory</p>
            </div>
        </header>
    );
}

export default Header;