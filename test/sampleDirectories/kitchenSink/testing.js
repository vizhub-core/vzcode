import { scaleLinear, max, color } from 'd3';

export const renderCircles = (
    selection,
    { descendants, fileSizeOpacityScale, fillColors },
) => {
    // Define the gradients
    const defs = selection.append('defs');

    const uniqueFillColors = Object.values(fillColors);

    uniqueFillColors.forEach((fillColor) => {
        if (fillColor) { // Check if fillColor is defined
            const sanitizedFillColor = fillColor.replace(/[^a-zA-Z0-9-_]/g, ''); // Remove invalid characters for HTML IDs
            defs
                .append('radialGradient')
                .attr('id', `gradient-${sanitizedFillColor}`)
                .selectAll('stop')
                .data([
                    {
                        offset: '0%',
                        color: color(fillColor).brighter(1.5).toString(),
                    },
                    { offset: '70%', color: fillColor },
                    {
                        offset: '100%',
                        color: color(fillColor).darker(1.5).toString(),
                    },
                ])
                .enter()
                .append('stop')
                .attr('offset', (d) => d.offset)
                .attr('stop-color', (d) => d.color);
        }
    });
};
