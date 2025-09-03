function calcularResultados(kgCompra, precoCompra, precoVenda, perda, vendaSol, vendaChuva, probSol, probChuva) {
  const kgFinal = kgCompra * (1 - perda);
  const custo = kgCompra * precoCompra;
  const vendidoSol = Math.min(kgFinal, vendaSol);
  const receitaSol = vendidoSol * precoVenda;
  const lucroSol = receitaSol - custo;
  const vendidoChuva = Math.min(kgFinal, vendaChuva);
  const receitaChuva = vendidoChuva * precoVenda;
  const lucroChuva = receitaChuva - custo;
  const lucroEsperado = lucroSol * probSol + lucroChuva * probChuva;
  return {
    kgCompra,
    kgFinal,
    custo,
    vendidoSol,
    receitaSol,
    lucroSol,
    vendidoChuva,
    receitaChuva,
    lucroChuva,
    lucroEsperado
  };
}

function melhorOpcao(opcoes, precoCompra, precoVenda, perda, vendaSol, vendaChuva, probSol, probChuva) {
  let melhor = null;
  let maiorEsperado = -Infinity;
  opcoes.forEach(kg => {
    let {lucroEsperado} = calcularResultados(kg, precoCompra, precoVenda, perda, vendaSol, vendaChuva, probSol, probChuva);
    if (lucroEsperado > maiorEsperado) {
      maiorEsperado = lucroEsperado;
      melhor = kg;
    }
  });
  return melhor;
}

function formatMoeda(v) {
  return 'R$ ' + v.toFixed(2).replace('.',',');
}

document.getElementById('decisionForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const precoCompra = parseFloat(document.getElementById('precoCompra').value);
  const precoVenda = parseFloat(document.getElementById('precoVenda').value);
  const perda = parseFloat(document.getElementById('perda').value) / 100;
  const vendaSol = parseFloat(document.getElementById('vendaSol').value);
  const vendaChuva = parseFloat(document.getElementById('vendaChuva').value);
  const probChuva = parseFloat(document.getElementById('probChuva').value) / 100;
  const probSol = 1 - probChuva;
  const optionsStr = document.getElementById('options').value;
  const opcoes = optionsStr.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n) && n > 0);
  if (opcoes.length === 0) {
    document.getElementById('tree').innerHTML = '<p style="color:red">Informe pelo menos uma opção válida de compra.</p>';
    return;
  }
  const melhor = melhorOpcao(opcoes, precoCompra, precoVenda, perda, vendaSol, vendaChuva, probSol, probChuva);
  let html = `<div style="margin-bottom:16px;font-size:1.1rem;text-align:left">
    <b>Árvore de Decisão</b> <br>
    <span style="color:#ff9800">Probabilidade de Sol: ${(probSol*100).toFixed(0)}% &nbsp;&nbsp; Probabilidade de Chuva: ${(probChuva*100).toFixed(0)}%</span>
  </div>`;
  html += '<div style="display:flex;flex-direction:column;align-items:flex-start;gap:24px;">';
  opcoes.forEach(kg => {
    const r = calcularResultados(kg, precoCompra, precoVenda, perda, vendaSol, vendaChuva, probSol, probChuva);
    html += `<div style="display:flex;align-items:center;">
      <div class="node${kg === melhor ? ' best' : ''}" style="min-width:180px;text-align:left;">
        <div>Compra: <b>${kg}kg</b></div>
        <div>Após perda: <b>${r.kgFinal.toFixed(1)}kg</b></div>
        <div>Custo: <b>${formatMoeda(r.custo)}</b></div>
        <div style="margin-top:8px;font-size:0.95rem;color:#888">Lucro esperado: <b style="color:#ff9800">${formatMoeda(r.lucroEsperado)}</b></div>
        ${kg === melhor ? '<div style="color:#ff9800;font-weight:bold;margin-top:8px;">Melhor opção</div>' : ''}
      </div>
      <div style="margin-left:24px;">
        <table style="border-collapse:collapse;font-size:0.98rem;">
          <tr><th></th><th style="color:#43c6ac">Sol (${(probSol*100).toFixed(0)}%)</th><th style="color:#43c6ac">Chuva (${(probChuva*100).toFixed(0)}%)</th></tr>
          <tr><td>Vendido</td><td>${r.vendidoSol}kg</td><td>${r.vendidoChuva}kg</td></tr>
          <tr><td>Receita</td><td>${formatMoeda(r.receitaSol)}</td><td>${formatMoeda(r.receitaChuva)}</td></tr>
          <tr><td>Lucro</td><td style="color:${r.lucroSol>=0?'#388e3c':'#d32f2f'}">${formatMoeda(r.lucroSol)}</td><td style="color:${r.lucroChuva>=0?'#388e3c':'#d32f2f'}">${formatMoeda(r.lucroChuva)}</td></tr>
        </table>
      </div>
    </div>`;
  });
  html += '</div>';
  document.getElementById('tree').innerHTML = html;
});
