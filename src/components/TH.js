import React from 'react';

const THeader = (props) => {
    const sortKey = `${props.children}`.toLowerCase();

    return (
        <th>
            {props.children} {"  "}
            <button
                type='button'
                className='btn btn-link p-0 align-baseline text-decoration-none'
                data-value={sortKey}
                onClick={props.handleSortBtnClick}
            >
                <i
                    className="fas fa-sort sortIcon"
                ></i>
            </button>
        </th>
    );
}

export default THeader;
