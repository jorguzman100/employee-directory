import React from 'react';

const TRow = (props) => {
    return (
        <tr>
            <td><img alt={`${props.firstName} ${props.lastName}`} className="img-fluid picture" src={props.picture} /></td>
            <td>{`${props.firstName} ${props.lastName}`}</td>
            <td>{props.email}</td>
            <td>{props.dob.date}</td>
            <td>{props.address}</td>
            <td>{props.city}</td>
            <td>{props.mobile}</td>
        </tr>
    );
}

export default TRow;

