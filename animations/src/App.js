import React, { useState, useEffect } from 'react';
import * as d3 from 'd3';
import './App.css';

const App = () => {
    const [text, setText] = useState('');
    const [wordData, setWordData] = useState([]);
    const [animate, setAnimate] = useState(false);

    const updateWordData = (inputText) => {
        const words = inputText
            .toLowerCase()
            .replace(/[^\w\s]/g, '') // Remove punctuation
            .split(/\s+/)
            .filter(Boolean); // Remove empty strings

        const wordCount = {};
        words.forEach(word => {
            wordCount[word] = (wordCount[word] || 0) + 1;
        });

        // Sort and get top 15 words
        const sortedWords = Object.entries(wordCount)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 15)
            .map(([word, count]) => ({ word, count }));

        // Randomly select a subset of words for animation
        const randomWords = sortedWords
            .sort(() => 0.5 - Math.random()) // Shuffle words
            .slice(0, 10); // Pick top 10 for animation

        setWordData(randomWords);
    };

    const handleInputChange = (e) => {
        setText(e.target.value);
    };

    const handleGenerateClick = () => {
        updateWordData(text);
        setAnimate(true); // Trigger animation on button click
    };

    useEffect(() => {
        if (!animate) return;

        const svg = d3.select('#wordCloud');
        svg.selectAll('*').remove(); // Clear existing elements

        const fontSizeScale = d3.scaleLinear()
            .domain([0, d3.max(wordData, d => d.count)])
            .range([20, 60]); // Adjust font size for readability

        const padding = 20;
        const maxColumns = 5; // Number of words per row

        // Add rectangular boundary
        svg.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', 1000) // Set fixed width for rectangle
            .attr('height', 400) // Set fixed height for rectangle
            .attr('fill', 'none')
            .attr('stroke', 'black')
            .attr('stroke-width', 2);

        let currentX = padding;
        let currentY = padding + 50;

        const words = svg.selectAll('text')
            .data(wordData, d => d.word);

        words.enter()
            .append('text')
            .attr('class', 'word')
            .attr('fill', 'steelblue')
            .attr('text-anchor', 'middle')
            .attr('font-size', 0) // Start at 0 for animation
            .attr('opacity', 0) // Start transparent
            .text(d => d.word)
            .attr('x', (d, i) => {
                if (i % maxColumns === 0 && i !== 0) {
                    currentX = padding;
                    currentY += fontSizeScale(d.count) + padding * 2;
                } else {
                    currentX += fontSizeScale(d.count) + padding * 2;
                }
                return currentX;
            })
            .attr('y', d => currentY)
            .transition()
            .duration(1000) // Animation duration for enter
            .attr('font-size', d => fontSizeScale(d.count))
            .attr('opacity', 1);

        words.exit()
            .transition()
            .duration(500)
            .attr('opacity', 0)
            .remove();

        setAnimate(false); // Reset animate after running
    }, [animate, wordData]); // Add wordData to dependency array

    return (
        <div className="App">
            <h1>Dynamic Word Cloud</h1>
            <textarea 
                rows="10" 
                cols="50" 
                value={text} 
                onChange={handleInputChange} 
                placeholder="Type your text here..."
            />
            <div>
                <button onClick={handleGenerateClick}>Generate WordCloud</button>
            </div>
            <svg id="wordCloud" width="1000" height="400"></svg>
        </div>
    );
};

export default App;
