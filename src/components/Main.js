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
        selectedResult: {},
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
    "JavaScript Problem: Sorting an Array of Objects"
    Source: https://www.youtube.com/watch?v=0d76_2sksWY
    */
    handleSortBtnClick = event => {
        const sortType = event.target.attributes.getNamedItem("data-value").value.toLowerCase();
        console.log('sortType: ', sortType);
        let objLevel1 = 'name';
        let objLevel2 = 'first';

        if (sortType === 'name') {
            objLevel1 = 'name';
            objLevel2 = 'first';
        } else if (sortType === 'city') {
            objLevel1 = 'location';
            objLevel2 = 'city';
        }

        if (this.state.order === 'ascend') {
            this.setState({
                filteredResults: this.state.filteredResults.sort((a, b) => {
                    if (a[`${objLevel1}`][`${objLevel2}`].toLowerCase() < b[`${objLevel1}`][`${objLevel2}`].toLowerCase()) return -1;
                    else if (a[`${objLevel1}`][`${objLevel2}`].toLowerCase() > b[`${objLevel1}`][`${objLevel2}`].toLowerCase()) return 1;
                    else return 0;
                }),
                order: 'descend'
            });
        } else {
            this.setState({
                filteredResults: this.state.filteredResults.sort((a, b) => {
                    if (a[`${objLevel1}`][`${objLevel2}`].toLowerCase() > b[`${objLevel1}`][`${objLevel2}`].toLowerCase()) return -1;
                    else if (a[`${objLevel1}`][`${objLevel2}`].toLowerCase() < b[`${objLevel1}`][`${objLevel2}`].toLowerCase()) return 1;
                    else return 0;
                }),
                order: 'ascend'
            });
        }
    };


    handleSelectRow = (event) => {
        //selectedResult:
        console.log('event.target: ', event.target);
        console.log('id: ', event.target.attributes.getNamedItem('dataid').value);
        let dataid = event.target.attributes.getNamedItem('dataid').value;
        this.setState({
            selectedResult: this.state.filteredResults.filter((result) => {
                if (result.id.value === dataid) {
                    return result
                }
            })
        });
        console.log('selectedResult: ', this.state.selectedResult);
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
                            <Map
                                results={this.state.filteredResults}
                                selectedResult={this.state.selectedResult}
                            />
                        </Card>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Card title='Details'>
                            <Table
                                results={this.state.filteredResults}
                                handleSortBtnClick={this.handleSortBtnClick}
                                handleSelectRow={this.handleSelectRow}
                            />
                        </Card>
                    </Col>
                </Row>
            </div>
        )
    };
}

export default Main;






