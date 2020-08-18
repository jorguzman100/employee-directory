import React from 'react';

const THeader = (props) => {
    return (
        <th>
            {props.children} {"  "}
            <a href='#'>
                <i
                    className="fas fa-sort text-info sortIcon"
                    data-value={props.children}
                    onClick={props.handleSortBtnClick}
                ></i>
            </a>
        </th>
    );
}

export default THeader;