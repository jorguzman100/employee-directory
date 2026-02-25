import React from 'react';
import TRow from './TRow';

const Table = (props) => {
    const {
        results,
        handleSortBtnClick,
        handleSelectRow,
        getResultId: externalGetResultId,
        onVisibleResultsChange,
        selectedRowId
    } = props;

    const tbodyRef = React.useRef(null);
    const visibleIdsRef = React.useRef('');

    const getResultId = React.useCallback((result, index) => {
        if (externalGetResultId) {
            return externalGetResultId(result, index);
        }

        return (result.id && result.id.value) ||
            (result.login && result.login.uuid) ||
            `${result.email}-${index}`;
    }, [externalGetResultId]);

    const publishVisibleRows = React.useCallback(() => {
        if (!onVisibleResultsChange) {
            return;
        }

        const tbody = tbodyRef.current;
        if (!tbody) {
            onVisibleResultsChange([]);
            return;
        }

        const bodyRect = tbody.getBoundingClientRect();
        const rowElements = Array.from(tbody.querySelectorAll('tr[data-row-index]'));

        const visibleItems = rowElements
            .filter((row) => {
                const rowRect = row.getBoundingClientRect();
                return rowRect.bottom > bodyRect.top && rowRect.top < bodyRect.bottom;
            })
            .map((row) => {
                const rowIndex = Number(row.getAttribute('data-row-index'));
                return {
                    rowIndex,
                    result: results[rowIndex]
                };
            })
            .filter(({ result }) => Boolean(result));

        const visibleResults = visibleItems.map(({ result }) => result);

        const visibleIds = visibleItems
            .map(({ result, rowIndex }) => getResultId(result, rowIndex))
            .join('|');

        if (visibleIds !== visibleIdsRef.current) {
            visibleIdsRef.current = visibleIds;
            onVisibleResultsChange(visibleResults);
        }
    }, [results, onVisibleResultsChange, getResultId]);

    React.useEffect(() => {
        // Refresh the visible rows list after sort/filter changes.
        visibleIdsRef.current = '__force_refresh__';
        publishVisibleRows();

        const tbody = tbodyRef.current;
        if (!tbody) {
            return;
        }

        let rafId = null;
        const handleScrollOrResize = () => {
            if (rafId) {
                cancelAnimationFrame(rafId);
            }

            rafId = window.requestAnimationFrame(() => {
                publishVisibleRows();
            });
        };

        tbody.addEventListener('scroll', handleScrollOrResize);
        window.addEventListener('resize', handleScrollOrResize);

        return () => {
            tbody.removeEventListener('scroll', handleScrollOrResize);
            window.removeEventListener('resize', handleScrollOrResize);
            if (rafId) {
                cancelAnimationFrame(rafId);
            }
        };
    }, [publishVisibleRows]);

    return (
        <div className="table-responsive">
            <table className="table table-hover">
                <thead>
                    <tr>
                        <th>Picture</th>
                        <th>Name {" "}
                            <button
                                type='button'
                                className='btn btn-link p-0 align-baseline text-decoration-none'
                                data-value='name'
                                onClick={handleSortBtnClick}
                                aria-label='Sort by name'
                            >
                                <i
                                    className="fas fa-sort sortIcon"
                                ></i>
                            </button>
                        </th>
                        <th>Email</th>
                        <th>DOB</th>
                        <th>Address</th>
                        <th>City {" "}
                             <button
                                type='button'
                                className='btn btn-link p-0 align-baseline text-decoration-none'
                                data-value='city'
                                onClick={handleSortBtnClick}
                                aria-label='Sort by city'
                             >
                                <i
                                    className="fas fa-sort sortIcon"
                                ></i>
                            </button>
                        </th>
                        <th>Cell</th>
                    </tr>
                </thead>
                <tbody ref={tbodyRef}>
                    {results.map((result, index) => {
                        const rowId = getResultId(result, index);
                        return (
                            <TRow
                                key={rowId}
                                rowIndex={index}
                                dataid={rowId}
                                isSelected={rowId === selectedRowId}
                                picture={result.picture.thumbnail}
                                firstName={result.name.first}
                                lastName={result.name.last}
                                email={result.email}
                                dob={result.dob.date.slice(0, 10)}
                                address={`${result.location.street.number} ${result.location.street.name}`}
                                city={result.location.city}
                                mobile={result.cell}
                                handleSelectRow={handleSelectRow}
                            />
                        )
                    })}
                </tbody>
            </table>
        </div>
    );
}

export default Table;
