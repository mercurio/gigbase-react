import React from 'react'
import {storiesOf} from '@storybook/react'
import {action} from '@storybook/addon-actions'

/* Center stories */
const centerStory = story => (
  <div style={{display: 'flex', justifyContent: 'center'}}>
    {story()}
  </div>
)

/** GigCard **/
import GigCard from '../src/components/GigCard'

let gigCardProps = {
  date: '2016-11-02',
  band: 'Leadbone',
  venue: 'Leadbone Studios',
  tracks: 42,
  recorded: true
}

storiesOf('GigCard', module)
  .addDecorator(centerStory)
  .add('recorded', () => {
    const gcp = {...gigCardProps}
    return <GigCard {...gcp} />
  })
  .add('not recorded', () => {
    const gcp = {...gigCardProps, recorded: false}
    return <GigCard {...gcp} />
  })
  .add('1 track', () => {
    const gcp = {...gigCardProps, tracks: 1}
    return <GigCard {...gcp} />
  })
  .add('0 tracks', () => {
    const gcp = {...gigCardProps, tracks: 0}
    return <GigCard {...gcp} />
  })

/** BandMenu **/
import BandMenu from '../src/components/BandMenu'

storiesOf('BandMenu', module)
  .addDecorator(centerStory)
  .add('one band', () => <BandMenu bands={['Leadbone']} />)
  .add('three bands', () => <BandMenu bands={['Leadbone', 'Tom Mix and the Masters', 'Cat Shit Six']} />)

/** RecChip **/
import RecChip from '../src/components/RecChip'

storiesOf('RecChip', module)
  .addDecorator(centerStory)
  .add('recorded', () => <RecChip recorded={true} />)
  .add('not recorded', () => <RecChip recorded={false} />)

/** PerformanceCard **/
import PerformanceCard from '../src/components/PerformanceCard'

let performanceCardProps = {
  serial: 1,
  stars: 0,
  song: 'All Along the Watchtower',
  drumkit: '93',
  songkey: 'A'
}

storiesOf('PerformanceCard', module)
  .addDecorator(centerStory)
  .add('no stars', () => {
    const pcp = {...performanceCardProps}
    return <PerformanceCard {...pcp} />
  })
  .add('5 stars', () => {
    const pcp = {...performanceCardProps, stars: 5}
    return <PerformanceCard {...pcp} />
  })
