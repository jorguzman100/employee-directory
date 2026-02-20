import React from 'react';

const Card = (props) => {
    return (
        <div className="card mt-4 app-card">
            <div className="card-header py-2 px-3 app-card-header">
                {props.title}
            </div>
            <div className="card-body app-card-body">
                {props.children}
            </div>
        </div>
    );
}

export default Card;
