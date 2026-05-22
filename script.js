// Mailing List Form

// check if email format is valid
function isValidEmail(email) {
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// name must be at least 2 chars, only letters and spaces
function isValidName(name) {
    var nameRegex = /^[a-zA-Z\s]{2,}$/;
    return nameRegex.test(name.trim());
}

function showError(fieldId, message) {
    var field = document.getElementById(fieldId);
    var errorSpan = document.getElementById(fieldId + 'Error');
    
    if (field && errorSpan) {
        field.classList.add('error');
        errorSpan.textContent = message;
    }
}

function clearError(fieldId) {
    var field = document.getElementById(fieldId);
    var errorSpan = document.getElementById(fieldId + 'Error');
    
    if (field && errorSpan) {
        field.classList.remove('error');
        errorSpan.textContent = '';
    }
}

// show success or error message to user
function showFormMessage(message, isSuccess) {
    var messageDiv = document.getElementById('formMessage');
    
    if (messageDiv) {
        messageDiv.textContent = message;
        messageDiv.className = 'form-message ' + (isSuccess ? 'success' : 'error');
    }
}

function validateMailingListForm() {
    var nameField = document.getElementById('name');
    var emailField = document.getElementById('email');
    
    if (!nameField || !emailField) {
        return null;
    }
    
    var name = nameField.value.trim();
    var email = emailField.value.trim();
    var isValid = true;
    
    // clear old errors first
    clearError('name');
    clearError('email');
    
    // validate name
    if (!name) {
        showError('name', 'Please enter your name.');
        isValid = false;
    } else if (!isValidName(name)) {
        showError('name', 'Please enter a valid name (letters and spaces only, minimum 2 characters).');
        isValid = false;
    }
    
    // validate email
    if (!email) {
        showError('email', 'Please enter your email address.');
        isValid = false;
    } else if (!isValidEmail(email)) {
        showError('email', 'Please enter a valid email address.');
        isValid = false;
    }
    
    if (isValid) {
        return { name: name, email: email };
    }
    return null;
}

// send form data to the server
async function submitMailingList(formData) {
    var submitBtn = document.getElementById('submitBtn');
    var messageDiv = document.getElementById('formMessage');
    
    // disable button while sending
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Subscribing...';
    }
    
    if (messageDiv) {
        messageDiv.className = 'form-message';
    }
    
    try {
        var response = await fetch('https://mudfoot.doc.stu.mmu.ac.uk/ash/api/mailinglist', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        var data = await response.json();
        
        if (response.ok) {
            showFormMessage('Thank you for subscribing, ' + formData.name + '! You have been added to our mailing list.', true);
            document.getElementById('mailingListForm').reset();
        } else {
            // server sent back an error
            var errorMessage = data.message || data.error || 'An error occurred. Please try again.';
            showFormMessage('Error: ' + errorMessage, false);
        }
    } catch (error) {
        console.error('Submission error:', error);
        showFormMessage('Unable to connect to the server. Please check your internet connection and try again.', false);
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Subscribe';
        }
    }
}


// Hall of Fame

function validateYear(yearValue) {
    clearError('year');
    
    var year = parseInt(yearValue, 10);
    
    if (isNaN(year)) {
        showError('year', 'Please enter a valid year.');
        return null;
    }
    
    if (year < 1986) {
        showError('year', 'The Hall of Fame started in 1986. Please enter a year from 1986 onwards.');
        return null;
    }
    
    var currentYear = new Date().getFullYear();
    if (year > currentYear) {
        showError('year', 'Please enter a year up to ' + currentYear + '.');
        return null;
    }
    
    return year;
}

// fetch hall of fame data from the API
async function fetchHallOfFame(year) {
    var loadingDiv = document.getElementById('hofLoading');
    var errorDiv = document.getElementById('hofError');
    var dataDiv = document.getElementById('hofData');
    var submitBtn = document.getElementById('hofSubmitBtn');
    
    if (loadingDiv) loadingDiv.style.display = 'block';
    if (errorDiv) {
        errorDiv.style.display = 'none';
        errorDiv.textContent = '';
    }
    if (dataDiv) dataDiv.innerHTML = '';
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Searching...';
    }
    
    try {
        var url = 'https://mudfoot.doc.stu.mmu.ac.uk/ash/api/halloffame?year=' + year;
        var response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Server returned status ' + response.status);
        }
        
        var data = await response.json();
        
        if (loadingDiv) loadingDiv.style.display = 'none';
        
        if (data && data.inductees && data.inductees.length > 0) {
            displayHallOfFameData(data, year);
        } else {
            if (errorDiv) {
                errorDiv.textContent = 'No Hall of Fame inductees found for ' + year + '. Try a different year.';
                errorDiv.style.display = 'block';
            }
        }
    } catch (error) {
        console.error('Hall of Fame error:', error);
        if (loadingDiv) loadingDiv.style.display = 'none';
        if (errorDiv) {
            errorDiv.textContent = 'Unable to fetch Hall of Fame data. Please check your connection and try again.';
            errorDiv.style.display = 'block';
        }
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Search';
        }
    }
}

// display the inductee cards on the page
function displayHallOfFameData(data, year) {
    var dataDiv = document.getElementById('hofData');
    if (!dataDiv) return;
    
    dataDiv.innerHTML = '';
    
    // year heading
    var yearHeading = document.createElement('h3');
    yearHeading.textContent = 'Class of ' + year;
    yearHeading.style.gridColumn = '1 / -1';
    yearHeading.style.marginBottom = '1rem';
    yearHeading.style.color = '#1c1410';
    dataDiv.appendChild(yearHeading);
    
    // create a card for each inductee
    data.inductees.forEach(function(inductee) {
        var card = document.createElement('article');
        card.className = 'hof-card';
        
        var img = document.createElement('img');
        if (inductee.image) {
            img.src = inductee.image;
        } else {
            img.src = 'https://via.placeholder.com/300x200?text=' + encodeURIComponent(inductee.name || 'Inductee');
        }
        img.alt = (inductee.name || 'Inductee') + ' - Rock and Roll Hall of Fame inductee';
        img.onerror = function() {
            this.src = 'https://via.placeholder.com/300x200?text=' + encodeURIComponent(inductee.name || 'Inductee');
        };
        
        var content = document.createElement('div');
        content.className = 'hof-card-content';
        
        var name = document.createElement('h3');
        name.textContent = inductee.name || 'Unknown Artist';
        
        var category = document.createElement('p');
        category.className = 'category';
        category.textContent = inductee.category || 'Performer';
        
        var description = document.createElement('p');
        if (inductee.description) {
            description.textContent = inductee.description;
        } else {
            description.textContent = 'Inducted into the Rock and Roll Hall of Fame in ' + year + '.';
        }
        
        content.appendChild(name);
        content.appendChild(category);
        content.appendChild(description);
        card.appendChild(img);
        card.appendChild(content);
        dataDiv.appendChild(card);
    });
}


// Set up event listeners when page loads

document.addEventListener('DOMContentLoaded', function() {
    
    // mailing list form
    var mailingListForm = document.getElementById('mailingListForm');
    
    if (mailingListForm) {
        mailingListForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            var formData = validateMailingListForm();
            if (formData) {
                submitMailingList(formData);
            }
        });
        
        // clear errors when user starts typing
        var nameInput = document.getElementById('name');
        var emailInput = document.getElementById('email');
        
        if (nameInput) {
            nameInput.addEventListener('input', function() {
                clearError('name');
            });
        }
        
        if (emailInput) {
            emailInput.addEventListener('input', function() {
                clearError('email');
            });
        }
    }
    
    // hall of fame form
    var hofForm = document.getElementById('hofForm');
    
    if (hofForm) {
        // load 2021 data by default
        fetchHallOfFame(2021);
        
        hofForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            var yearInput = document.getElementById('year');
            if (yearInput) {
                var year = validateYear(yearInput.value);
                if (year !== null) {
                    fetchHallOfFame(year);
                }
            }
        });
        
        var yearInput = document.getElementById('year');
        if (yearInput) {
            yearInput.addEventListener('input', function() {
                clearError('year');
            });
        }
    }
});
