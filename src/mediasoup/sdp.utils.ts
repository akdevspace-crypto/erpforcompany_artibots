import { types } from 'mediasoup';

// Mappings from Mediasoup kinds to SDP strings
export const createSdpText = (rtpParameters: types.RtpParameters, remoteRtpPort: number, remoteRtcpPort: number, ip: string) => {
    const { codecs, encodings } = rtpParameters;
    const codec = codecs[0];

    return `v=0
o=- 0 0 IN IP4 ${ip}
s=FFmpeg
c=IN IP4 ${ip}
t=0 0
m=audio ${remoteRtpPort} RTP/AVP ${codec.payloadType}
a=rtcp:${remoteRtcpPort}
a=rtpmap:${codec.payloadType} ${codec.mimeType.split('/')[1]}/${codec.clockRate}/${codec.channels}
a=sendonly
`;
};
