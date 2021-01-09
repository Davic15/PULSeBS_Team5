import React from 'react';
import "./Legend.css";
import "bootstrap/dist/css/bootstrap.min.css";
//import "../../../node_modules/bootstrap/dist/css/bootstrap.min.css";

const LegendFilter = (props) => {
    const onFiltersChange = (event) => {
        const filters = props.filters;
        filters[event.target.id].checked = event.target.checked;
        props.onFiltersChange(filters);
    }

    return (
        <div class="container" style={{marginBottom: "40px", marginTop:"5px"}}>
            <div className="move-bottom">
                <fieldset class="row the-fieldset">
                    <legend class="the-legend">Color Legend</legend>
                    {props.filters.map((filter, index) => {
                        return <div class="col-md-3">
                                <div className="legend-square div1" style={{backgroundColor: filter.color}}></div>
                                <label className="div1" htmlFor={index}>{filter.name}</label>
                                <label className="div1 custom-control custom-checkbox">
                                    <input className="custom-control-input" type="checkbox" id={index} checked={props.filters[index].checked} onChange={(event) => onFiltersChange(event)} />
                                    <span class="custom-control-indicator"></span>
                                </label>
                        </div>;
                    })}
                </fieldset>
            </div>
        </div>             
    );
}

export default LegendFilter;