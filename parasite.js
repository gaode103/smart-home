function setValue(element, key, value) {
    if (element) {
        if (!element.pData) {
            element.pData = {};
        }
        element.pData[key] = value;
    }
}

function getValue(element, key, defaultValue) {
    if (element && element.pData) {
        return element.pData[key];
    } else {
        return defaultValue;
    }
}


function findParentValue(element, key) {
    while(element) {
        var value = getValue(element, key);
        if (value === undefined) {
            if (element.nodeType === Node.ELEMENT_NODE) {
                element = element.parentElement();
            } else {
                return;
            }
        } else {
            return value;
        }
    }
}