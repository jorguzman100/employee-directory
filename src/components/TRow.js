import React from 'react';

const TRow = (props) => {
    return (
        <tr onClick={props.handleSelectRow} dataid={props.dataid}>
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

