$(document).ready(function() {
    var address = $('#searchAddress').val();

    $.ajax({
        type: "GET",
        url: '/api/account/details/' + address,
        success: function(result) {
            $('#walletAddress').html(address);
            $('#verosBalance').html(numeral(result.data.verosBalance).format('0,0') + " VEROS");
            $('#ethBalance').html(numeral(result.data.ethBalance).format('0,0') + " ETH");
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