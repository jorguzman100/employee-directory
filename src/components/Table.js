import React from 'react';
import TRow from './TRow';
import TH from './TH';

const Table = (props) => {
    console.log('Table()');
    console.log('props.results: ', props.results);

    return (
        <div className="table-responsive">
            <table className="table table-hover">
                <thead>
                    <tr>
                        <th>Picture</th>
                        <th>Name {" "}
                            <a href='#'>
                                <i
                                    className="fas fa-sort text-info sortIcon"
                                    data-value='Name'
                                    onClick={props.handleSortBtnClick}
                                ></i>
                            </a>
                        </th>
                        <th>Email</th>
                        <th>DOB</th>
                        <th>Address</th>
                        <th>City</th>
                        <th>Cell</th>
                    </tr>
                </thead>
                <tbody>
                    {props.results.map((result, index) => {
                        return (
                            <TRow
                                key={index}
                                picture={result.picture.thumbnail}
                                firstName={result.name.first}
                                lastName={result.name.last}
                                email={result.email}
                                dob={result.dob.date.slice(0, 10)}
                                address={`${result.location.street.number} ${result.location.street.name}`}
                                city={result.location.city}
                                mobile={result.cell}
                            />
                        )
                    })}
                </tbody>
            </table>
        </div>
    );
}

export default Table;
