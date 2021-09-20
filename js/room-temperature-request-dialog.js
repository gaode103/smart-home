var dialogContainer = document.getElementById('dialogContainer');
var RequestDialog = {
    show: function(roomId) {
        dialogContainer.style.display = 'block';
        RequestDialog.roomId = roomId;
    }
};

(function (dialogDiv) {
    dialogDiv.style.display = 'none';
    var tempInput = appendChildWithAttribute(dialogDiv, 'input', {
        'type': 'number',
        'min': '4',
        'max': '30',
        'step': '0.5',
        'placeholder': 'Temperature',
        'style': 'width: 100%; margin: 0 0 10px;'
    });
    addValueButton(dialogDiv, tempInput, 14);
    addValueButton(dialogDiv, tempInput, 19);
    addValueButton(dialogDiv, tempInput, 20);
    addValueButton(dialogDiv, tempInput, 21);
    addValueButton(dialogDiv, tempInput, 22);
    var timeInput = appendChildWithAttribute(dialogDiv, 'input', {
        'type': 'number',
        'min': '1',
        'max': '1440',
        'step': '1',
        'placeholder': 'Minutes',
        'style': 'width: 100%; margin: 10px 0 10px;'
    });
    addValueButton(dialogDiv, timeInput, 30);
    addValueButton(dialogDiv, timeInput, 60);
    addValueButton(dialogDiv, timeInput, 90);
    addValueButton(dialogDiv, timeInput, 120);
    addValueButton(dialogDiv, timeInput, 150);
    var confirmAction = appendChildWithAttribute(dialogDiv, 'a', {
        'style': 'position: absolute; left: 30px; bottom: 20px;'
    });
    confirmAction.innerText = 'OK';
    confirmAction.onclick = function () {
        if(tempInput.value.length > 0 && timeInput.value.length > 0) {
            dialogDiv.style.display = 'none';
            postJson('/instantRequest/heating', {
                roomId: RequestDialog.roomId,
                temperature: tempInput.value,
                endTime: new Date().getTime() + timeInput.value * 60000
            }, function (text) {
                alert(text);
            });
        }
    };
    var cancelAction = appendChildWithAttribute(dialogDiv, 'a', {
        'style': 'position: absolute; right: 30px; bottom: 20px;'
    });
    cancelAction.innerText = 'Cancel';
    cancelAction.onclick = function () {
        dialogDiv.style.display = 'none';
    };
    dialogDiv.appendChild(confirmAction);
    dialogDiv.appendChild(cancelAction);
}(dialogContainer));