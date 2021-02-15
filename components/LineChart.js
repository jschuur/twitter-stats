import React from 'react';
import dynamic from 'next/dynamic';

const ApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function LineChart({ snapshots, title, width }) {
  // TODO: Responsive chart config
  const options = {
    chart: {
      id: 'twitterstats',
      width: '100%',
      toolbar: {
        show: false,
      },
      animations: {
        enabled: false,
      },
    },
    legend: {
      fontSize: '10px',
      markers: {
        width: 6,
        height: 6,
      },
      itemMargin: {
        vertical: 20,
        horizontal: 5,
      },
    },
    stroke: {
      width: 2,
      // curve: 'smooth',
    },
    title: {
      text: title,
      align: 'center',
      margin: 0,
      style: {
        fontSize: '18px',
        fontWeight: 300,
      },
    },
    xaxis: {
      type: 'datetime',
    },
  };

  const series = snapshots.map(({ username, data }) => ({
    name: username,
    data: data.map(({ date, value }) => ({ x: new Date(date), y: value })),
  }));

  return (
    <div className='w-96 p-2'>
      <ApexChart options={options} series={series} type='line' />
    </div>
  );
}
