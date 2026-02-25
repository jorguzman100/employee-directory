import React, { Component } from 'react';
import Row from './Row';
import Col from './Col';
import Card from './Card';
import Search from './Search';
import Table from './Table';
import Map from './Map/Map';
import API from '../utils/API';

class Main extends Component {
    state = {
        results: [],
        filteredResults: [],
        visibleResults: [],
        selectedResult: {},
        order: 'ascend',
        search: ""
    };

    componentDidMount() {
        this.searchEmployees();
    }

    searchEmployees = () => {
        API.search()
            .then((res) => {
                this.setState({
                    results: res.data.results,
                    filteredResults: res.data.results,
                    visibleResults: [],
                    selectedResult: {}
                });
            })
            .catch((error) => console.error(error));
    };

    getResultId = (result, index) => {
        return (result.id && result.id.value) ||
            (result.login && result.login.uuid) ||
            `${result.email}-${index}`;
    };

    handleInputChange = event => {
        const value = event.target.value.toLowerCase();
        const name = event.target.name;
        const filteredResults = this.state.results.filter((result) => {
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
            return compareData.toLowerCase().includes(value);
        });

        this.setState({
            [name]: value,
            filteredResults,
            visibleResults: [],
            selectedResult: {}
        });
    };

    handleFormSubmit = event => {
        event.preventDefault();
        this.searchEmployees();
    };
    handleSortBtnClick = event => {
        const sortType = event.currentTarget.dataset.value;
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
                filteredResults: [...this.state.filteredResults].sort((a, b) => {
                    if (a[`${objLevel1}`][`${objLevel2}`].toLowerCase() < b[`${objLevel1}`][`${objLevel2}`].toLowerCase()) return -1;
                    else if (a[`${objLevel1}`][`${objLevel2}`].toLowerCase() > b[`${objLevel1}`][`${objLevel2}`].toLowerCase()) return 1;
                    else return 0;
                }),
                order: 'descend',
                visibleResults: [],
                selectedResult: {}
            });
        } else {
            this.setState({
                filteredResults: [...this.state.filteredResults].sort((a, b) => {
                    if (a[`${objLevel1}`][`${objLevel2}`].toLowerCase() > b[`${objLevel1}`][`${objLevel2}`].toLowerCase()) return -1;
                    else if (a[`${objLevel1}`][`${objLevel2}`].toLowerCase() < b[`${objLevel1}`][`${objLevel2}`].toLowerCase()) return 1;
                    else return 0;
                }),
                order: 'ascend',
                visibleResults: [],
                selectedResult: {}
            });
        }
    };


    handleSelectRow = (event) => {
        const target = event.target.closest('[dataid]');
        if (!target) {
            return;
        }

        const dataid = target.getAttribute('dataid');
        this.setState((prevState) => ({
            selectedResult: prevState.filteredResults.find((result, index) => this.getResultId(result, index) === dataid) || {}
        }));
    };

    handleVisibleResultsChange = (visibleResults) => {
        this.setState({ visibleResults });
    };
    render() {
        const selectedRowId = this.state.selectedResult && Object.keys(this.state.selectedResult).length
            ? this.getResultId(this.state.selectedResult, 0)
            : '';

        return (
            <div className="container app-container">
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
                                results={this.state.visibleResults}
                                selectedResult={this.state.selectedResult}
                                theme={this.props.theme}
                            />
                        </Card>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Card title='Details'>
                            <Table
                                results={this.state.filteredResults}
                                getResultId={this.getResultId}
                                onVisibleResultsChange={this.handleVisibleResultsChange}
                                handleSortBtnClick={this.handleSortBtnClick}
                                handleSelectRow={this.handleSelectRow}
                                selectedRowId={selectedRowId}
                            />
                        </Card>
                    </Col>
                </Row>
            </div>
        )
    };
}

export default Main;
