$('#createWalletButton').click(function() {
    var password = $('#passwordField').val();
    var repeatPassword = $('#repeatPasswordField').val();
    if (password != repeatPassword) {
        alert("Password and repeat password don't match");
        return ;
    }

    if (password.length < 8) {
        alert("Please enter a password of at least 8 characters.");
        return ;
    }

    waitingDialog.show("Creating wallet");

    $.ajax({
        type: "POST",
        url: "/api/account/create",
        data: {
            "password":password
        },
        success: function(result) {
            waitingDialog.hide();
            if (result.success) {
                $('#walletAddress').html(result.data.address);
                $('#myModal').modal('show');
            }

        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            waitingDialog.hide();
            alert("Could not create wallet!");
        },
        dataType: 'json'
    });
});

$('#downloadWalletButton').click(function() {
    window.open(
        '/api/account/download/' + $('#walletAddress').html(),
        '_blank'
    );
});


$('#continueButton').click(function() {
    window.location = "/wallet";
});