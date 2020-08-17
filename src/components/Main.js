import React, { Component } from 'react';
import Row from './Row';
import Col from './Col';
import Card from './Card';
import Search from './Search'
import Table from './Table';
import Map from './Map';
import API from '../utils/API';


class Main extends Component {
    state = {
        results: [],
        result: {},
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
                    results: res.data.results
                });
            })
            .catch(err => console.log(err));
    };

    handleInputChange = event => {
        const value = event.target.value;
        const name = event.target.name;
        this.setState({
            [name]: value
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
                        <Card title='Map'>
                            <Map />
                        </Card>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Card title='Employees details'>
                            <Table results={this.state.results}/>
                        </Card>
                    </Col>
                </Row>
            </div>
        )
    };
}

export default Main;






