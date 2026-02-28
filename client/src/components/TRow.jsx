import React from 'react';

const TRow = (props) => {
    const rowClassName = props.isSelected ? 'table-row-active' : '';

    return (
        <tr
            className={rowClassName}
            onClick={props.handleSelectRow}
            dataid={props.dataid}
            data-row-index={props.rowIndex}
        >
            <td dataid={props.dataid}><img alt={`${props.firstName} ${props.lastName}`} className="img-fluid picture" src={props.picture} dataid={props.dataid} /></td>
            <td dataid={props.dataid}>{`${props.firstName} ${props.lastName}`}</td>
            <td dataid={props.dataid}>{props.email}</td>
            <td dataid={props.dataid}>{props.dob}</td>
            <td dataid={props.dataid}>{props.address}</td>
            <td dataid={props.dataid}>{props.city}</td>
            <td dataid={props.dataid}>{props.mobile}</td>
        </tr>
    );
}

export default TRow;
