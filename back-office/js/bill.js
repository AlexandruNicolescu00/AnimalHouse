jQuery(function () {
  const token = window.localStorage.getItem("adminToken");
  if (!token) {
    window.location.replace("/back-office/login");
  }
  getBills();
});
const getDateTime = (dateString) => {
  const formattedDate = dateString.slice(0, 10);
  const formattedTime = dateString.slice(11, 16);
  return `${formattedDate} ${formattedTime}`;
};

const getBills = async (query) => {
  const response = await fetch("https://site212222.tw.cs.unibo.it/api/v1/bill?" + new URLSearchParams(query));
  if (!response.ok) {
    const error = await response.json();
    const errorTemplate = Handlebars.compile($("#errorTemplate").html());
    const filled = errorTemplate({ error: error.msg });
    $("#error").html(filled);
  }
  const bills = await response.json();
  if (bills.length > 0) {
    const billsTemplate = Handlebars.compile($("#billsTemplate").html());
    for (const bill of bills) {
      bill.paidAt = getDateTime(bill.paidAt);
      bill.total = bill.total.toFixed(2);
    }
    const filled = billsTemplate({ bills: bills });
    $("#tableRows").html(filled);
    drawCharts(bills);
  } else {
    $("#tableRows").html("");
  }
};

const getBill = async (id) => {
  if (id) {
    const response = await fetch(`https://site212222.tw.cs.unibo.it/api/v1/bill/${id}`);
    if (!response.ok) {
      const error = await response.json();
      const errorTemplate = Handlebars.compile($("#errorTemplate").html());
      const filled = errorTemplate({ error: error.msg });
      $("#error").html(filled);
      return;
    }
    const bill = await response.json();
    return bill;
  }
};

const populateViewBill = async (id) => {
  const bill = await getBill(id);
  document.getElementById("viewBillUser").textContent = bill.user.email;
  const container = document.getElementById("content");
  container.innerHTML = "";
  if (bill.type == "service") {
    const content = document.createElement("span");
    content.classList.add("p-2", "w-full");
    content.textContent = `${bill.service.serviceName} ${bill.service.price.toFixed(2)}€`;
    container.appendChild(content);
  } else {
    for (let i = 0; i < bill.products.length; i += 1) {
      if (bill.products[i].product != null) {
        const content = document.createElement("p");
        content.classList.add("p-2", "w-full");
        content.textContent = `${bill.products[i].product.name} x${bill.products[i].quantity} ${bill.products[i].product.price.toFixed(2)}€`;
        container.appendChild(content);
      }
    }
  }
  const iva = Number(bill.total) * 0.22;
  document.getElementById("viewBillTotal").textContent = `${bill.total.toFixed(2)}€ (di cui IVA ${iva.toFixed(2)}€)`;
  document.getElementById("viewBillPaymantMethod").textContent = bill.paymentMethod;
  document.getElementById("viewBillPaidAt").textContent = getDateTime(bill.paidAt);
};

const drawCharts = (bills) => {
  drawLine(bills);
  drawPie(bills);
};

const drawLine = (bills) => {
  /* Preparo i dati per chart js */
  const data = {
    labels: bills.map((bill) => new Date(bill.createdAt).toLocaleDateString()),
    datasets: [
      {
        label: "Vendite",
        data: bills.map((bill) => bill.total),
        borderColor: "green",
        fill: false,
      },
    ],
  };

  // Creare un elemento canvas in cui verrà disegnato il grafico
  const canvasLine = document.getElementById("chartLine").getContext("2d");
  // Creare il grafico utilizzando Chart.js
  new Chart(canvasLine, {
    type: "line",
    data,
  });
};

const drawPie = (bills) => {
  let totProducts = 0;
  let totService = 0;
  for (let i = 0; i < bills.length; i += 1) {
    if (bills[i].type == "service") {
      totService += Number(bills[i].total);
    }
    if (bills[i].type == "products") {
      totProducts += Number(bills[i].total);
    }
  }

  const data = [
    {
      label: "Prodotti",
      value: totProducts.toFixed(2),
      color: "orange",
    },
    {
      label: "Servizi",
      value: totService.toFixed(2),
      color: "lightblue",
    },
  ];

  const canvasPie = document.getElementById("chartPie").getContext("2d");

  // Creare il grafico utilizzando Chart.js
  new Chart(canvasPie, {
    type: "pie",
    data: {
      labels: data.map((d) => d.label),
      datasets: [
        {
          data: data.map((d) => d.value),
          backgroundColor: data.map((d) => d.color),
        },
      ],
    },
  });
};
