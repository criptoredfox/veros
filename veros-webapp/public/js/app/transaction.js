$(document).ready(function() {
    var transactionId = $('#transactionId').val();


    $.ajax({
        url: "/api/network/transactions/" + transactionId,
        type: "GET",
        dataType: 'json',
        success: function(result) {
            $('#transactionDate').html(new Date(result.data.datetime * 1000));
            $('#transactionAmount').html(numeral(result.data.amount).format('0,0') + " VEROS");
            $('#transactionFromAddress').html(result.data.senderAddress);
            $('#transactionToAddress').html(result.data.recipientAddress);
            //$('#totalSupply').html(numeral(result.data.totalSupply).format('0,0') + " VEROS");
        }
    });

    $.ajax({
        url: "/api/network/statistics",
        type: "GET",
        dataType: 'json',
        success: function(result) {
            console.log(result);
            $('#availableSupply').html(numeral(result.data.availableSupply).format('0,0') + " VEROS");
            $('#totalSupply').html(numeral(result.data.totalSupply).format('0,0') + " VEROS");
        }
    });
});