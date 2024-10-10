let cartTotal = 0;

function addItemToCart(price) {
  // Nome da função corrigido
  cartTotal += price;
  updateCartTotal();
}

function updateCartTotal() {
  document.getElementById("cart-total").textContent = `R$${cartTotal.toFixed(
    2
  )}`; // Corrigida interpolação de string
  renderPaypalButton(cartTotal);
}

function renderPaypalButton(amount) {
  // Remove o botão existente se já estiver renderizado
  document.getElementById("paypal-button-container").innerHTML = "";

  paypal
    .Buttons({
      style: {
        layout: "vertical",
        color: "blue",
        shape: "rect",
        label: "paypal",
      },
      createOrder: function (data, actions) {
        return actions.order.create({
          purchase_units: [
            {
              amount: {
                value: amount.toFixed(2), // Corrigido valor do pagamento
              },
            },
          ],
        });
      },
      onApprove: function (data, actions) {
        return actions.order.capture().then(function (details) {
          alert(
            "Transação concluída por " + details.payer.name.given_name + "!"
          );

          // Enviar dados para o servidor
          fetch("/paypal-transaction-complete", {
            method: "post",
            headers: {
              "content-type": "application/json",
            },
            body: JSON.stringify({
              orderID: data.orderID,
              payerID: data.payerID,
              paymentDetails: details,
            }),
          })
            .then(function (response) {
              return response.json();
            })
            .then(function (data) {
              console.log("Resposta do servidor:", data);
            })
            .catch(function (error) {
              console.error("Erro ao enviar dados para o servidor:", error);
            });
        });
      },
      onError: function (err) {
        console.error("Erro no pagamento:", err);
        const errorElement = document.getElementById("card-errors");
        errorElement.textContent =
          "Ocorreu um erro ao processar o pagamento. Tente novamente.";
      },
    })
    .render("#paypal-button-container"); // Renderiza o botão PayPal
}
