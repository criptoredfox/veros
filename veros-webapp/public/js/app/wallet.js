$(document).ready(function() {
    $.ajax({
        type: "GET",
        url: '/api/account/current',
        success: function(result) {
            if (result.success) {
                console.log(result);
                console.log(result.ethBalance);
                $('#walletAddress').html(result.address);
                $('#verosBalance').html(numeral(result.verosBalance).format('000,000,000.000000') + " VEROS");
                $('#ethBalance').html(numeral(result.ethBalance).format('000,000,000.000000') + " ETH");
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

    $('#sendEthButton').click(function() {
        var address = $('#sendEthAddress').val();
        var amount = $('#sendEthAmount').val();
        console.log(address.length);
        if (address.length == 42 && amount) {
            waitingDialog.show("Sending ETH transaction");
            $.ajax({
                type: "POST",
                url: '/api/send-eth',
                dataType: 'json',
                data: {
                    address:address,
                    amount:amount
                },
                success: function(result) {
                    waitingDialog.hide();
                    $('#sendEthAddress').val('');
                    $('#sendEthAmount').val('');
                    alert("ETH Transaction has been sent.");
                }
            });
        } else {
            alert("Invalid address or amount");
        }
    });

    $('#sendStakingAmount').change(function() {
        var amount = $(this).val();
        if (amount > 0.0) {
            $('#interestLabel').html("You will receive <span class='badge bg-color-greenLight'>" + amount/100 + " VEROS </span> per day");
        }
    });

    $('#sendStakingButton').click(function() {
        var amount = $('#sendStakingAmount').val();
        if (amount) {
            waitingDialog.show("Sending staking...");
            $.ajax({
                type: "POST",
                url: '/api/send-staking',
                dataType: 'json',
                data: {
                    amount:amount
                },
                success: function(result) {
                    waitingDialog.hide();
                    $('#sendStakingAmount').val('');
                    $('#interestLabel').val('Enter value to check the interest!');
                }
            });
        } else {
            alert("Invalid amount");
        }
    });
});