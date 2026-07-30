"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSdpText = void 0;
const createSdpText = (rtpParameters, remoteRtpPort, remoteRtcpPort, ip) => {
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
exports.createSdpText = createSdpText;
//# sourceMappingURL=sdp.utils.js.map