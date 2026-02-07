import { prisma } from '../config/database.js';

export const getReporteMensual = async (req, res) => {
  try {
    const { anio, mes } = req.query;
    const anioNum = anio ? Number(anio) : new Date().getFullYear();
    const mesNum = mes ? Number(mes) : new Date().getMonth() + 1;
    const movimientos = await prisma.movimiento.findMany({
      where: { anio: anioNum, mes: mesNum },
      orderBy: { fecha: 'asc' },
    });
    const ingresos = movimientos.filter((m) => m.tipo === 'INGRESO').reduce((s, m) => s + Number(m.monto), 0);
    const gastos = movimientos.filter((m) => m.tipo === 'GASTO').reduce((s, m) => s + Number(m.monto), 0);
    res.json({
      data: {
        anio: anioNum,
        mes: mesNum,
        movimientos,
        totalIngresos: ingresos,
        totalGastos: gastos,
        balance: ingresos - gastos,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const exportReporteExcel = async (req, res) => {
  try {
    const { anio, mes } = req.query;
    const anioNum = anio ? Number(anio) : new Date().getFullYear();
    const mesNum = mes ? Number(mes) : new Date().getMonth() + 1;
    const movimientos = await prisma.movimiento.findMany({
      where: { anio: anioNum, mes: mesNum },
      orderBy: { fecha: 'asc' },
    });
    const ingresos = movimientos.filter((m) => m.tipo === 'INGRESO').reduce((s, m) => s + Number(m.monto), 0);
    const gastos = movimientos.filter((m) => m.tipo === 'GASTO').reduce((s, m) => s + Number(m.monto), 0);
    const balance = ingresos - gastos;
    // CSV simple (sin dependencia exceljs para no añadir peso)
    const header = 'Fecha,Tipo,Concepto,Categoría,Monto\n';
    const rows = movimientos.map(
      (m) =>
        `${m.fecha.toISOString().split('T')[0]},${m.tipo},${(m.concepto || '').replace(/,/g, ';')},${(m.categoria || '').replace(/,/g, ';')},${m.monto}`
    );
    const totales = `\n,,TOTAL INGRESOS,,${ingresos}\n,,TOTAL GASTOS,,${gastos}\n,,BALANCE,,${balance}`;
    const csv = header + rows.join('\n') + totales;
    const filename = `reporte_${anioNum}_${String(mesNum).padStart(2, '0')}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send('\uFEFF' + csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
