import React from 'react';

const Header = () => {
    return (
        <header className="App-header">
            <div className="sticky-top bg-info text-white text-center py-2">
                <h3><span role="img" aria-label="employee emoji">👩🏻‍💼👨🏻‍💼</span> Employee Directory</h3>
            </div>
        </header>
    );
}

export default Header;