
(function(){
  window.toggleFrameworkMenu = function(force){
    const panel = document.getElementById('frameworkMenu');
    const shade = document.getElementById('frameworkShade');
    const willOpen = (typeof force === 'boolean') ? force : !panel.classList.contains('open');
    panel.classList.toggle('open', willOpen);
    shade.classList.toggle('open', willOpen);
  };
})();
