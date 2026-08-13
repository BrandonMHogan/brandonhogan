# Kingdom Calibration Design

## Goal

Make the approved retro kingdom composition stay proportional and spatially coherent across desktop aspect ratios, while giving villagers visibly independent commutes.

## World projection

The source landscape always retains its native aspect ratio. It is scaled to the viewport width and anchored to the bottom; tall viewports gain additional sky above, while ultrawide viewports crop only excess sky from the top. One pure projection converts normalized map coordinates into screen coordinates. Phaser buildings, effects, villagers, and the HTML controls all use that projection.

Building placement uses calibrated footprint anchors rather than a universal image center. The Farm grows to visual parity with the Lumber Camp, the Town sits on the road junction, the Quarry machinery sits against the cave mouth, and the Castle aligns its centered entrance to the hill path. The Castle receives a wider, lower 16-bit sprite with a centered door.

## Villager movement

Each work group receives distinct lanes derived from villager order. Routes share the readable roads but offset intermediate points and workplace endpoints so villagers neither overlap in transit nor stack while working. Dawn departures are staggered by a few hundred milliseconds. Idle villagers continue wandering independently.

## Time

Day and night each last five minutes. Production remains disabled during night and while assigned workers are commuting.

## Verification

Pure tests cover aspect-preserving projection, calibrated screen points, distinct worker routes, and the five-minute phase duration. Manual checks cover standard, tall, and ultrawide desktop viewports plus a complete forced day/night transition.
