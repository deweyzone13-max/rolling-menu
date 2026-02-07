// Menu list storage - each item has {name, probability}
let menus = [];

// DOM elements
const menuInput = document.getElementById('menuInput');
const addButton = document.getElementById('addButton');
const defaultButton = document.getElementById('defaultButton');
const submitButton = document.getElementById('submitButton');
const menuTableBody = document.getElementById('menuTableBody');
const modalOverlay = document.getElementById('modalOverlay');
const spinningWheel = document.getElementById('spinningWheel');
const stopButton = document.getElementById('stopButton');
const closeModalButton = document.getElementById('closeModalButton');
const resultText = document.getElementById('resultText');

// Initialize display
function initializeDisplay() {
    updateDisplay();
}

// Calculate equal probability
function getEqualProbability() {
    return menus.length > 0 ? (100 / menus.length).toFixed(1) : 0;
}

// Add menu function
function addMenu() {
    const menuText = menuInput.value.trim();
    
    if (menuText === '') {
        alert('메뉴를 입력해주세요.');
        return;
    }
    
    // Check maximum limit
    if (menus.length >= 100) {
        alert('메뉴는 최대 100개까지 추가할 수 있습니다.');
        return;
    }
    
    // Add menu with equal probability
    const equalProb = getEqualProbability();
    menus.push({
        name: menuText,
        probability: parseFloat(equalProb)
    });
    
    // Update all probabilities to be equal
    setEqualProbabilities();
    
    menuInput.value = '';
    updateDisplay();
    menuInput.focus();
}

// Set all probabilities to equal
function setEqualProbabilities() {
    if (menus.length === 0) return;
    
    const equalProb = parseFloat(getEqualProbability());
    menus.forEach(menu => {
        menu.probability = equalProb;
    });
    updateDisplay();
}

// Update probability for a specific menu
function updateProbability(index, value) {
    const numValue = parseFloat(value);
    
    if (isNaN(numValue) || numValue < 0) {
        // Reset to current value if invalid
        updateDisplay();
        return;
    }
    
    menus[index].probability = numValue;
    updateDisplay();
}

// Delete menu function
function deleteMenu(index) {
    if (confirm('정말 이 메뉴를 삭제하시겠습니까?')) {
        menus.splice(index, 1);
        // Update all probabilities to be equal after deletion
        if (menus.length > 0) {
            setEqualProbabilities();
        } else {
            updateDisplay();
        }
    }
}

// Update display
function updateDisplay() {
    // Clear current display
    menuTableBody.innerHTML = '';
    
    // Display menus and probabilities
    if (menus.length === 0) {
        // Show empty state
        const emptyRow = document.createElement('tr');
        emptyRow.className = 'empty-row';
        const emptyCell = document.createElement('td');
        emptyCell.colSpan = 2;
        emptyCell.textContent = '메뉴가 없습니다';
        emptyRow.appendChild(emptyCell);
        menuTableBody.appendChild(emptyRow);
    } else {
        menus.forEach((menu, index) => {
            const row = document.createElement('tr');
            
            // Menu name column
            const menuCell = document.createElement('td');
            const menuWrapper = document.createElement('div');
            menuWrapper.className = 'menu-wrapper';
            
            const menuText = document.createElement('span');
            menuText.className = 'menu-text';
            menuText.textContent = menu.name;
            menuWrapper.appendChild(menuText);
            
            const deleteButton = document.createElement('button');
            deleteButton.className = 'delete-button';
            deleteButton.innerHTML = '🗑️';
            deleteButton.setAttribute('aria-label', '삭제');
            deleteButton.title = '삭제';
            deleteButton.addEventListener('click', () => {
                deleteMenu(index);
            });
            menuWrapper.appendChild(deleteButton);
            
            menuCell.appendChild(menuWrapper);
            row.appendChild(menuCell);
            
            // Probability column
            const probCell = document.createElement('td');
            const probInput = document.createElement('input');
            probInput.type = 'number';
            probInput.className = 'probability-input';
            probInput.value = menu.probability.toFixed(1);
            probInput.min = '0';
            probInput.step = '0.1';
            probInput.addEventListener('change', (e) => {
                updateProbability(index, e.target.value);
            });
            probInput.addEventListener('blur', (e) => {
                if (e.target.value === '' || isNaN(parseFloat(e.target.value))) {
                    e.target.value = menu.probability.toFixed(1);
                }
            });
            probCell.appendChild(probInput);
            row.appendChild(probCell);
            
            menuTableBody.appendChild(row);
        });
    }
}

// Check if probabilities sum to approximately 100
function checkProbabilities() {
    const sum = menus.reduce((total, menu) => total + menu.probability, 0);
    const tolerance = 0.5; // Allow 0.5% tolerance
    return Math.abs(sum - 100) <= tolerance;
}

// Generate random color for wheel segments
const colorPalette = [
    '#f44336', '#ffeb3b', '#03a9f4', '#3f51b5', '#9c27b0',
    '#795548', '#4caf50', '#ff9800', '#e91e63', '#00bcd4'
];

// Create spinning wheel using SVG
function createSpinningWheel() {
    const totalProbability = menus.reduce((sum, menu) => sum + menu.probability, 0);
    const radius = 200; // SVG radius
    const centerX = radius;
    const centerY = radius;
    
    let currentAngle = -90; // Start from top (12 o'clock)
    let pathElements = '';
    let textElements = '';
    
    menus.forEach((menu, index) => {
        const segmentAngle = (menu.probability / totalProbability) * 360;
        const startAngleRad = (currentAngle * Math.PI) / 180;
        const endAngleRad = ((currentAngle + segmentAngle) * Math.PI) / 180;
        const largeArc = segmentAngle > 180 ? 1 : 0;
        
        // Calculate arc endpoints
        const x1 = centerX + radius * Math.cos(startAngleRad);
        const y1 = centerY + radius * Math.sin(startAngleRad);
        const x2 = centerX + radius * Math.cos(endAngleRad);
        const y2 = centerY + radius * Math.sin(endAngleRad);
        
        // Create path for this segment
        const path = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
        
        pathElements += `<path d="${path}" fill="${colorPalette[index % colorPalette.length]}" data-index="${index}" data-start-angle="${currentAngle}" data-end-angle="${currentAngle + segmentAngle}"></path>`;
        
        // Calculate text position (middle of segment)
        const textAngle = currentAngle + segmentAngle / 2;
        const textAngleRad = (textAngle * Math.PI) / 180;
        const textRadius = radius * 0.65; // Position text at 65% of radius
        const textX = centerX + textRadius * Math.cos(textAngleRad);
        const textY = centerY + textRadius * Math.sin(textAngleRad);
        
        // Create text element
        textElements += `<text x="${textX}" y="${textY}" fill="white" font-size="16" font-weight="bold" text-anchor="middle" dominant-baseline="middle" style="text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">${menu.name}</text>`;
        
        currentAngle += segmentAngle;
    });
    
    spinningWheel.innerHTML = `
        <svg width="400" height="400" viewBox="0 0 400 400" style="width: 100%; height: 100%;">
            ${pathElements}
            ${textElements}
        </svg>
    `;
}

// Spin the wheel
let isSpinning = false;
let spinAnimation = null;
let currentRotation = 0;
let stopTimeout = null; // Store timeout for result display

function startSpinning() {
    if (isSpinning) return;
    
    isSpinning = true;
    stopButton.disabled = false;
    resultText.textContent = '';
    currentRotation = 0;
    
    function animate() {
        currentRotation += 10;
        spinningWheel.style.transform = `rotate(${currentRotation}deg)`;
        spinAnimation = requestAnimationFrame(animate);
    }
    
    animate();
}

function stopSpinning() {
    if (!isSpinning) return;
    
    isSpinning = false;
    stopButton.disabled = true;
    
    // Cancel animation frame
    if (spinAnimation) {
        cancelAnimationFrame(spinAnimation);
        spinAnimation = null;
    }
    
    const totalProbability = menus.reduce((sum, menu) => sum + menu.probability, 0);
    
    // Randomize the final position based on probabilities
    const randomValue = Math.random() * totalProbability;
    let cumulativeProb = 0;
    let winningIndex = 0;
    
    for (let i = 0; i < menus.length; i++) {
        cumulativeProb += menus[i].probability;
        if (randomValue <= cumulativeProb) {
            winningIndex = i;
            break;
        }
    }
    
    // Calculate the angle where the winning segment should be at the top
    // Pointer is at top (0 degrees), segments start at -90 degrees (top)
    // We need to rotate so the winning segment is positioned correctly at the pointer
    
    // Calculate cumulative angles for each segment (in original wheel coordinates, starting from -90)
    let cumulativeAngle = -90; // Start from top
    for (let i = 0; i < winningIndex; i++) {
        cumulativeAngle += (menus[i].probability / totalProbability) * 360;
    }
    
    // The winning segment's angle range
    const winningSegmentAngle = (menus[winningIndex].probability / totalProbability) * 360;
    const segmentStartAngle = cumulativeAngle;
    const segmentEndAngle = cumulativeAngle + winningSegmentAngle;
    
    // We want the pointer (at 0 degrees) to point to somewhere in the winning segment
    // After rotation, the segment will be at: segmentStartAngle + rotation
    // We want: 0 degrees (pointer) to be between (segmentStartAngle + rotation) and (segmentEndAngle + rotation)
    // So: segmentStartAngle + rotation <= 0 <= segmentEndAngle + rotation
    // Or: -segmentEndAngle <= rotation <= -segmentStartAngle
    
    // Choose a random point within the segment for more natural result
    const randomOffset = Math.random() * winningSegmentAngle;
    const targetPointInSegment = segmentStartAngle + randomOffset;
    
    // We want this point to be at 0 degrees (pointer position) after rotation
    // So: targetPointInSegment + rotation = 0
    // Therefore: rotation = -targetPointInSegment
    const targetAngle = -targetPointInSegment;
    
    // Add multiple full rotations for visual effect
    const extraRotations = 3 + Math.random() * 2; // 3-5 full rotations
    const finalRotation = (extraRotations * 360) + targetAngle;
    
    // Reset current rotation for accurate calculation
    currentRotation = 0;
    spinningWheel.style.transition = 'transform 3s cubic-bezier(0.17, 0.67, 0.12, 0.99)';
    spinningWheel.style.transform = `rotate(${finalRotation}deg)`;
    
    // Update currentRotation to final value for reference
    currentRotation = finalRotation;
    
    // Show result after 3 seconds
    stopTimeout = setTimeout(() => {
        const winner = menus[winningIndex];
        resultText.textContent = `결과 : ${winner.name} 당첨`;
        stopButton.disabled = false;
        stopTimeout = null;
    }, 3000);
}

// Submit function
function submitMenus() {
    if (menus.length === 0) {
        alert('메뉴를 추가해주세요.');
        return;
    }
    
    // Check probabilities
    if (!checkProbabilities()) {
        const sum = menus.reduce((total, menu) => total + menu.probability, 0);
        alert(`확률의 합이 100%가 아닙니다. 현재 합계: ${sum.toFixed(1)}%\n확률의 합을 100%로 맞춰주세요.`);
        return;
    }
    
    // Create and show spinning wheel
    createSpinningWheel();
    modalOverlay.classList.add('show');
    startSpinning();
}

// Close modal
function closeModal() {
    // Cancel any ongoing animations
    if (spinAnimation) {
        cancelAnimationFrame(spinAnimation);
        spinAnimation = null;
    }
    
    // Clear any pending timeouts
    if (stopTimeout) {
        clearTimeout(stopTimeout);
        stopTimeout = null;
    }
    
    // Reset spinning state
    isSpinning = false;
    currentRotation = 0;
    
    // Reset UI
    modalOverlay.classList.remove('show');
    spinningWheel.style.transition = '';
    spinningWheel.style.transform = 'rotate(0deg)';
    resultText.textContent = '';
    stopButton.disabled = false;
}

// Event listeners
addButton.addEventListener('click', addMenu);

defaultButton.addEventListener('click', setEqualProbabilities);

submitButton.addEventListener('click', submitMenus);

stopButton.addEventListener('click', stopSpinning);

closeModalButton.addEventListener('click', closeModal);

modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
        closeModal();
    }
});

menuInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addMenu();
    }
});

// Initialize on page load
initializeDisplay();

