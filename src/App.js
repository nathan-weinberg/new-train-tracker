import React from 'react';
import './App.css';

import { greenLine } from './lines';
import { prerenderLine } from './prerender';
import { useMbtaApi } from './useMbtaApi';

const renderViewbox = ({ minX, minY, width, height }) => {
    return `${minX} ${minY} ${width} ${height}`;
};

const renderRelativeStyles = ({ width, height }) => {
    if (width > height) {
        return { width: '100%' };
    }
    return { height: '100%' };
};

const renderLine = ({
    pathDirective,
    stationPositions,
    trainPositions,
    bounds,
    stroke,
    padding = 20,
}) => {
    const { top, bottom, left, right } = bounds;
    const width = right - left;
    const height = bottom - top;
    const viewbox = renderViewbox({
        minX: left - padding,
        minY: top - padding,
        width: width + padding * 2,
        height: height + padding * 2,
    });
    return (
        <svg viewBox={viewbox} style={renderRelativeStyles(viewbox)}>
            <path d={pathDirective} stroke={stroke} fill="transparent" />
            {Object.entries(stationPositions).map(([stationId, pos]) => {
                return (
                    <circle
                        key={stationId}
                        cx={pos.x}
                        cy={pos.y}
                        r={1}
                        fill={stroke}
                    />
                );
            })}
            {trainPositions.map((pos, index) => (
                <circle
                    key={index}
                    cx={pos.x}
                    cy={pos.y}
                    r={3}
                    fill="transparent"
                    stroke={stroke}
                />
            ))}
        </svg>
    );
};

const locateTrain = ({
    train,
    stationsByRoute,
    stationPositions,
    routeInterpolators,
}) => {
    const { route, stationId, direction } = train;
    const stations = stationsByRoute[route];
    const toStation = stations.find(station => station.id === stationId);
    const indexOfStation = stations.indexOf(toStation);
    const fromStation =
        direction === 0
            ? stations[indexOfStation - 1]
            : stations[indexOfStation + 1];
    if (fromStation) {
        try {
            const trainInterpolator = routeInterpolators.reduce(
                (inter, routeInterpolator) => {
                    return (
                        inter ||
                        routeInterpolator.getInterpolatorBetweenStations(
                            fromStation,
                            toStation
                        )
                    );
                },
                null
            );
            return trainInterpolator(train);
        } catch (_) {}
    }
    return stationPositions[stationId];
};

function App() {
    const { stationsByRoute, trainsByRoute } = useMbtaApi([greenLine]);

    if (stationsByRoute && trainsByRoute) {
        const {
            pathDirective,
            bounds,
            stationPositions,
            routeInterpolators,
        } = prerenderLine(greenLine, stationsByRoute);

        const trainPositions = Object.entries(trainsByRoute)
            .map(([_, trains]) =>
                trains.map(train =>
                    locateTrain({
                        train,
                        stationsByRoute,
                        stationPositions,
                        routeInterpolators,
                    })
                )
            )
            .reduce((a, b) => [...a, ...b], []);

        return (
            <div className="app">
                {renderLine({
                    pathDirective,
                    bounds,
                    stationPositions,
                    trainPositions,
                    stroke: 'black',
                })}
            </div>
        );
    }

    return <div className="app">Loading...</div>;
}

export default App;
