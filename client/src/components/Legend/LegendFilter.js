import React from 'react';
import "./Legend.css";

const LegendFilter = (props) => {
    const onFiltersChange = (event) => {
        const filters = props.filters;
        filters[event.target.id].checked = event.target.checked;
        props.onFiltersChange(filters);
    }

    return (
        <div class="container" style={{marginBottom: "40px", marginTop:"5px"}}>
            <div>
                <fieldset class="row the-fieldset">
                    <legend class="the-legend">Color Legend</legend>
                    {props.filters.map((filter, index) => {
                        return <div class="col-sm">
                            <div className="legend-square div1" style={{backgroundColor: filter.color}}></div>
                            <input type="checkbox" id={index} checked={props.filters[index].checked} onChange={(event) => onFiltersChange(event)} />
                            <label htmlFor={index}>{filter.name}</label>
                        </div>;
                    })}
                </fieldset>
            </div>
        </div>             
    );
}

export default LegendFilter;