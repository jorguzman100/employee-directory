import React, { Component } from 'react';
import Row from './Row';
import Col from './Col';
import Card from './Card';
import Search from './Search'
import Table from './Table';
import Map from './Map/Map';
import API from '../utils/API';


class Main extends Component {
    state = {
        results: [],
        filteredResults: [],
        order: 'ascend',
        search: ""
    };

    componentDidMount() {
        this.searchEmployees();
    }

    searchEmployees = (query) => {
        API.search(query)
            .then((res) => {
                // console.log('res: ', res.data.results);
                this.setState({
                    results: res.data.results,
                    filteredResults: res.data.results
                });
            })
            .catch(err => console.log(err));
    };

    handleInputChange = event => {
        const value = event.target.value.toLowerCase();
        const name = event.target.name;
        this.setState({
            [name]: value,
            filteredResults: this.state.results.filter((result) => {
                let compareData = `
                ${result.name.first} 
                ${result.name.last} 
                ${result.email} 
                ${result.dob.date.slice(0, 10)} 
                ${result.location.street.number} 
                ${result.location.street.name} 
                ${result.location.city} 
                ${result.cell}
                `;
                if (compareData.toLowerCase().includes(value)) {
                    return result;
                }
            })
        });
    };

    handleFormSubmit = event => {
        event.preventDefault();
        this.searchEmployees(this.state.search);
    };

    /* 
    picture={result.picture.thumbnail}
    firstName={result.name.first}
    lastName={result.name.last}
    email={result.email}
    dob={result.dob.date.slice(0,10)}
    {result.location.street.name}`}
    city={result.location.city}
    mobile={result.cell}
    */

    /* 
    "JavaScript Problem: Sorting an Array of Objects"
    Source: https://www.youtube.com/watch?v=0d76_2sksWY
    */
    handleSortBtnClick = () => {

        if (this.state.order === 'ascend') {
            this.setState({
                filteredResults: this.state.filteredResults.sort((a, b) => {
                    if (a.name.first.toLowerCase() < b.name.first.toLowerCase()) return -1;
                    else if (a.name.first.toLowerCase() > b.name.first.toLowerCase()) return 1;
                    else return 0;
                }),
                order: 'descend'
            });
        } else {
            this.setState({
                filteredResults: this.state.filteredResults.sort((a, b) => {
                    if (a.name.first.toLowerCase() > b.name.first.toLowerCase()) return -1;
                    else if (a.name.first.toLowerCase() < b.name.first.toLowerCase()) return 1;
                    else return 0;
                }),
                order: 'ascend'
            });
        }
    }



    render() {
        return (
            <div className="container">
                <Row>
                    <Col>
                        <Card title='Search'>
                            <Search
                                value={this.state.search}
                                handleInputChange={this.handleInputChange}
                                handleFormSubmit={this.handleFormSubmit} />
                        </Card>
                    </Col>
                    <Col>
                        <Card title={'Locations 🌍'}>
                            <Map results={this.state.results} />
                        </Card>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Card title='Details'>
                            <Table
                                results={this.state.filteredResults}
                                handleSortBtnClick={this.handleSortBtnClick}
                            />
                        </Card>
                    </Col>
                </Row>
            </div>
        )
    };
}

export default Main;






