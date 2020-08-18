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
        order: 'descend',
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
                            <Map results={this.state.results}/>
                        </Card>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Card title='Details'>
                            <Table results={this.state.filteredResults}/>
                        </Card>
                    </Col>
                </Row>
            </div>
        )
    };
}

export default Main;






