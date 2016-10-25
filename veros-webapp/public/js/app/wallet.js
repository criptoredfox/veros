$(document).ready(function() {
    $.ajax({
        type: "GET",
        url: '/api/account/current',
        success: function(result) {
            if (result.success) {
                $('#walletAddress').html(result.address);
                $('#verosBalance').html(numeral(result.verosBalance).format('0,0') + " VEROS");
                $('#ethBalance').html(numeral(result.ethBalance).format('0,0') + " ETH");
            } else {
                window.location = "/lock";
            }

        }
    });

    $('#sendVeroButton').click(function() {
        var address = $('#sendVeroAddress').val();
        var amount = $('#sendVeroAmount').val();
        console.log(address.length);
        if (address.length == 42 && amount) {
            waitingDialog.show("Sending transaction");
            $.ajax({
                type: "POST",
                url: '/api/send-vero',
                dataType: 'json',
                data: {
                    address:address,
                    amount:amount
                },
                success: function(result) {
                    waitingDialog.hide();
                    $('#sendVeroAddress').val('');
                    $('#sendVeroAmount').val('');
                    alert("Transaction has been sent.");
                }
            });
        } else {
            alert("Invalid address or amount");
        }
    });
});