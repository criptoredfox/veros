$('#loginButton').click(function(e) {
    var address = $('#walletAddress').val();
    var password = $('#walletPassword').val();
    if (address.length != 42) {
        alert("Please enter a valid address.");
        return ;
    }
    waitingDialog.show("Unlock wallet");
    $.ajax({
        url: "/api/account/unlock",
        type: "POST",
        dataType: 'json',
        data: {
            address: address,
            password: password
        },
        success: function(result) {
            waitingDialog.hide();
            if (result.success) {
                window.location = '/wallet'
            } else {
                alert("Invalid address or password");
            }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            waitingDialog.hide();
            alert("Invalid address or password");
        }
        });

    e.preventDefault();
});