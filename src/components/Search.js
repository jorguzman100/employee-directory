import React from 'react';

const Search = (props) => {
    return (
        <div className="input-group mb-3">
            <input className="form-control" type="text" placeholder="Find name, email, DOB, address, city, or mobile" name="search" value={props.value} onChange={props.handleInputChange}/>
            <div className="input-group-append">
                <button className="btn btn-outline-secondary" type="button" onClick={props.handleFormSubmit}>Search</button>
            </div>
        </div>
    );
}

export default Search;






