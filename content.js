// content.js

// inject.js

const questions = [
    { id: 'school', label: 'School Importance (1-10):', type: 'range', min: 1, max: 10, value: 5 },
    { id: 'income', label: 'Your Income:', type: 'number', min: 0, placeholder: 'Enter your income' },
    { id: 'transport', label: 'Transport Accessibility (1-10):', type: 'range', min: 1, max: 10, value: 5 },
    { id: 'amenities', label: 'Local Amenities (1-10):', type: 'range', min: 1, max: 10, value: 5 },
    // Add more questions as needed
];

// Function to create form elements based on the questions array
const createFormElements = (questions) => {
    return questions.map(q => {
        let inputElement = '';
        if (q.type === 'range') {
            inputElement = `<input type="range" id="${q.id}" name="${q.id}" min="${q.min}" max="${q.max}" value="${q.value}">`;
        } else if (q.type === 'number') {
            inputElement = `<input type="number" id="${q.id}" name="${q.id}" min="${q.min}" placeholder="${q.placeholder}">`;
        }
        // Extend with more input types as needed
        return `
            <label for="${q.id}">${q.label}</label>
            ${inputElement}<br>
        `;
    }).join('');
};

// Function to inject the popup UI into the page
const injectPopup = () => {
    // Create a container for the popup
    const popupContainer = document.createElement('div');
    popupContainer.id = 'realestate-popup';
    popupContainer.classList.add('realestate-popup'); // Assign the CSS class

    // Add a close button
    const closeButton = document.createElement('button');
    closeButton.id = 'closePopup';
    closeButton.innerHTML = '&times;'; // HTML entity for ×
    popupContainer.appendChild(closeButton);

    // Add the rest of the content
    const content = document.createElement('div');
    content.innerHTML = `
        <h3 id="popupTitle">Rate this Property</h3>
        <form id="popupForm">
            ${createFormElements(questions)}
            <button type="submit">Submit</button>
        </form>
    `;
    popupContainer.appendChild(content);

    // Append the popup to the body of the website
    document.body.appendChild(popupContainer);

    // Set ARIA attributes for accessibility
    popupContainer.setAttribute('role', 'dialog');
    popupContainer.setAttribute('aria-modal', 'true');
    popupContainer.setAttribute('aria-labelledby', 'popupTitle');

    // Make the popup focusable and set focus to it
    popupContainer.tabIndex = -1;
    popupContainer.focus();

    // Optional: Trap focus within the popup
    document.addEventListener('focus', function(event) {
        if (!popupContainer.contains(event.target)) {
            event.stopPropagation();
            popupContainer.focus();
        }
    }, true);

    // Trigger the show animation
    setTimeout(() => {
        popupContainer.classList.add('show');
    }, 10); // Slight delay to allow CSS transition

    // Handle the form submission
    document.getElementById('popupForm').addEventListener('submit', function (e) {
        e.preventDefault();

        const preferences = {};
        questions.forEach(q => {
            preferences[q.id] = document.getElementById(q.id).value;
        });

        console.log("Preferences to save:", preferences);  // Debug log

        // Store preferences using Chrome storage API or localStorage
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
            chrome.storage.sync.set({ preferences }, function () {
                if (chrome.runtime.lastError) {
                    console.error("Error saving preferences:", chrome.runtime.lastError);  // Debugging error
                } else {
                    console.log('Preferences saved:', preferences);  // Success log
                }
            });
        } else {
            localStorage.setItem('preferences', JSON.stringify(preferences));
            console.log('Preferences saved in localStorage:', preferences);  // Success log for localStorage
        }

        // Provide feedback to the user
        alert('Preferences saved!');

        // Send data to the server
        fetch('http://localhost:5000/saveSurvey', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(preferences),
        })
        .then((response) => response.json())
        .then((data) => {
            console.log('Survey data saved:', data);
            alert('Preferences saved!');
        })
        .catch((error) => {
            console.error('Error saving data:', error);
            alert('There was an error saving your preferences.');
        });

        // Close the popup after submission
        document.body.removeChild(popupContainer);
    });

    // Handle close button click
    closeButton.addEventListener('click', () => {
        document.body.removeChild(popupContainer);
    });
};

// Inject the popup when the page loads
window.addEventListener('load', injectPopup);

// content.js
// content.js
// content.js

(function() {
    // Function to extract address based on the current URL
    const extractAddress = () => {
        let address = '';
        const url = window.location.href;

        // Helper function to parse URL segments
        const parseUrlSegments = (url, regex) => {
            const match = url.match(regex);
            return match ? match.slice(1) : null;
        };

        // Redfin
        if (url.includes('redfin.com')) {
            const segments = parseUrlSegments(url, /redfin\.com\/([^\/]+)\/([^\/]+)\/([^\/]+)/);
            if (segments) {
                const [state, city, streetAddress] = segments;
                address = `${streetAddress.replace(/-/g, ' ')}, ${city.replace(/-/g, ' ')}, ${state}`;
            }
        }
        // Zillow
        else if (url.includes('zillow.com')) {
            const segments = parseUrlSegments(url, /zillow\.com\/homedetails\/([^\/]+)/);
            if (segments) {
                address = segments[0].replace(/-/g, ' ');
            }
        }
        // Homes.com
        else if (url.includes('homes.com')) {
            const segments = parseUrlSegments(url, /homes\.com\/property\/([^\/]+)/);
            if (segments) {
                address = segments[0].replace(/-/g, ' ');
            }
        }

        return address;
    };

    // Function to save address
    const saveAddress = (address) => {
        if (!address) return;

        console.log("Extracted Address:", address);

        const storageKey = 'myExtension.extractedAddress';
        
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            chrome.storage.local.set({ [storageKey]: address }, () => {
                if (chrome.runtime.lastError) {
                    console.error("Error saving address:", chrome.runtime.lastError);
                } else {
                    console.log(`Address saved in cache under key '${storageKey}'.`);
                }
            });
        } else {
            localStorage.setItem(storageKey, address);
            console.log(`Address saved in localStorage under key '${storageKey}'.`);
        }
    };

    // Main function to extract and save address
    const processAddress = () => {
        const address = extractAddress();
        saveAddress(address);
    };

    // Run the extraction function when the content script loads
    processAddress();

    // Run the extraction function when the URL changes
    let lastUrl = location.href;
    const observer = new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
            lastUrl = url;
            processAddress();
        }
    });

    observer.observe(document, { subtree: true, childList: true });
})();

// Popup injection code (unchanged)
const questions = [
    { id: 'school', label: 'School Importance (1-10):', type: 'range', min: 1, max: 10, value: 5 },
    { id: 'income', label: 'Your Income:', type: 'number', min: 0, placeholder: 'Enter your income' },
    { id: 'transport', label: 'Transport Accessibility (1-10):', type: 'range', min: 1, max: 10, value: 5 },
    { id: 'amenities', label: 'Local Amenities (1-10):', type: 'range', min: 1, max: 10, value: 5 },
];

// Function to create form elements based on the questions array
const createFormElements = (questions) => {
    return questions.map(q => {
        let inputElement = '';
        if (q.type === 'range') {
            inputElement = `<input type="range" id="${q.id}" name="${q.id}" min="${q.min}" max="${q.max}" value="${q.value}">`;
        } else if (q.type === 'number') {
            inputElement = `<input type="number" id="${q.id}" name="${q.id}" min="${q.min}" placeholder="${q.placeholder}">`;
        }
        return `
            <label for="${q.id}">${q.label}</label>
            ${inputElement}<br>
        `;
    }).join('');
};

// Function to inject the popup UI into the page
const injectPopup = () => {
    const popupContainer = document.createElement('div');
    popupContainer.id = 'realestate-popup';
    popupContainer.classList.add('realestate-popup');

    const closeButton = document.createElement('button');
    closeButton.id = 'closePopup';
    closeButton.innerHTML = '&times;';
    popupContainer.appendChild(closeButton);

    const content = document.createElement('div');
    content.innerHTML = `
        <h3 id="popupTitle">Rate this Property</h3>
        <form id="popupForm">
            ${createFormElements(questions)}
            <button type="submit">Submit</button>
        </form>
    `;
    popupContainer.appendChild(content);

    document.body.appendChild(popupContainer);

    popupContainer.setAttribute('role', 'dialog');
    popupContainer.setAttribute('aria-modal', 'true');
    popupContainer.setAttribute('aria-labelledby', 'popupTitle');

    popupContainer.tabIndex = -1;
    popupContainer.focus();

    document.addEventListener('focus', function(event) {
        if (!popupContainer.contains(event.target)) {
            event.stopPropagation();
            popupContainer.focus();
        }
    }, true);

    setTimeout(() => {
        popupContainer.classList.add('show');
    }, 10);

    document.getElementById('popupForm').addEventListener('submit', function (e) {
        e.preventDefault();

        const preferences = {};
        questions.forEach(q => {
            preferences[q.id] = document.getElementById(q.id).value;
        });

        console.log("Preferences to save:", preferences);

        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
            chrome.storage.sync.set({ preferences }, function () {
                if (chrome.runtime.lastError) {
                    console.error("Error saving preferences:", chrome.runtime.lastError);
                } else {
                    console.log('Preferences saved:', preferences);
                }
            });
        } else {
            localStorage.setItem('preferences', JSON.stringify(preferences));
            console.log('Preferences saved in localStorage:', preferences);
        }

        alert('Preferences saved!');

        fetch('http://localhost:5000/saveSurvey', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(preferences),
        })
        .then((response) => response.json())
        .then((data) => {
            console.log('Survey data saved:', data);
            alert('Preferences saved!');
        })
        .catch((error) => {
            console.error('Error saving data:', error);
            alert('There was an error saving your preferences.');
        });

        document.body.removeChild(popupContainer);
    });

    closeButton.addEventListener('click', () => {
        document.body.removeChild(popupContainer);
    });
};

window.addEventListener('load', injectPopup);