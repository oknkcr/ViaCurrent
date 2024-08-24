document.getElementById('viaForm').addEventListener('submit', function (e) {
    e.preventDefault();

    // Get form values
    const viaDiameter = parseFloat(document.getElementById('viaDiameter').value);
    const platingThickness = parseFloat(document.getElementById('platingThickness').value) / 1000; // Convert µm to mm
    const pcbThickness = parseFloat(document.getElementById('pcbThickness').value);
    const tempRise = parseFloat(document.getElementById('tempRise').value);
    const internalPadDiameter = parseFloat(document.getElementById('internalPadDiameter').value);
    const refPlaneOpeningDiameter = parseFloat(document.getElementById('refPlaneOpeningDiameter').value);
    const ambientTemp = parseFloat(document.getElementById('ambientTemp').value);
    const current = parseFloat(document.getElementById('current').value);

    // Validation: Ensure all values are valid
    if (isNaN(viaDiameter) || isNaN(platingThickness) || isNaN(pcbThickness) || isNaN(tempRise) ||
        isNaN(internalPadDiameter) || isNaN(refPlaneOpeningDiameter) || isNaN(ambientTemp) ||
        isNaN(current)) {
        alert("Please fill in all fields correctly.");
        return;
    }

    // Calculate Via Cross-Sectional Area
    const innerDiameter = viaDiameter/2;
    const area = Math.PI * (Math.pow((innerDiameter + platingThickness), 2) - Math.pow(innerDiameter,2)); // in mm²
    const areaMils = area * 1550; // Convert mm² to mils²

    // Calculate Current-Carrying Capacity (Ampacity)
	const viaLength = pcbThickness;
    const k = 0.048;
    const b = 0.44;
    const c = 0.725;
    const currentCapacity = k * Math.pow(tempRise, b) * Math.pow(areaMils, c);

    // Calculate Resistance
    const resistivity = 1.9e-6; // Ohm-cm for plated copper
    const length = pcbThickness / 10; // Convert mm to cm
    const areaCm = area / 100; // Convert mm² to cm²
    const resistance = (resistivity * length / areaCm) * 1000;

    // Temperature-Corrected Resistance
    const alpha = 0.00393; // Temperature coefficient of copper
    const resistanceAtTemp = (resistance/1000) * (1 + alpha * tempRise);

    // Calculate Voltage Drop
    const voltageDrop = current * resistanceAtTemp * 1000;

    // Calculate Power Loss
    const powerLoss = (Math.pow(current, 2) * resistanceAtTemp) * 1000;

    // Inductance (in nH)
    const inductance = 5.08 * (viaLength / 25.4) * (Math.log((4 * (viaLength / 25.4)) / (viaDiameter / 25.4)) + 1); // nH

    // Capacitance (in pF)
    const epsilonR = 4.3; // Relative permittivity for FR4
    const capacitance = (0.55 * epsilonR * (pcbThickness/10) * (internalPadDiameter/10)) / (( refPlaneOpeningDiameter / 10) - (internalPadDiameter/10))

    // Calculate Impedance (Z = sqrt(L / C))
    const impedance = Math.sqrt((inductance * 10e-9) / (capacitance* 10e-12));

    // Calculate Resonant Frequency (f = 1 / (2π * sqrt(LC)))
    const resonantFrequency = (1 / (2 * Math.PI * Math.sqrt(inductance * 10e-9  * capacitance * 10e-12))) * 10e-6;

    // Step Response (τ = Z * C)
    const stepResponse = impedance * capacitance;

    // Aspect Ratio (PCB Thickness / Via Diameter)
    const aspectRatio = pcbThickness / viaDiameter;

    // Via Temperature Calculation
    const viaTemp = ambientTemp + tempRise;

    // Display results
    document.getElementById('areaResult').innerText = `Cross-Sectional Area: ${area.toFixed(4)} mm² (${areaMils.toFixed(2)} mils²)`;
    document.getElementById('currentCapacityResult').innerText = `Estimated Ampacity: ${currentCapacity.toFixed(4)} A`;
    document.getElementById('resistanceResult').innerText = `Resistance: ${resistanceAtTemp.toFixed(6)} Ohms`;
    document.getElementById('voltageDropResult').innerText = `Voltage Drop: ${voltageDrop.toFixed(6)} mV`;
    document.getElementById('powerLossResult').innerText = `Power Loss: ${powerLoss.toFixed(6)} mW`;
    document.getElementById('inductanceResult').innerText = `Inductance: ${inductance.toFixed(2)} nH`;
    document.getElementById('capacitanceResult').innerText = `Capacitance: ${capacitance.toFixed(2)} pF`;
    document.getElementById('impedanceResult').innerText = `Impedance: ${impedance.toFixed(6)} Ω`;
    document.getElementById('resonantFreqResult').innerText = `Resonant Frequency: ${resonantFrequency.toFixed(6)} MHz`;
    document.getElementById('stepResponseResult').innerText = `Step Response: ${stepResponse.toFixed(6)} ps`;
    document.getElementById('aspectRatioResult').innerText = `Aspect Ratio: ${aspectRatio.toFixed(2)}`;
    document.getElementById('viaTempResult').innerText = `Via Temperature: ${viaTemp.toFixed(2)} °C`;
});
