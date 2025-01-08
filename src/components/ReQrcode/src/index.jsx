/* eslint-disable no-use-before-define */
import propTypes from "@/utils/propTypes";
import RefreshRight from "@iconify-icons/ep/refresh-right";
import { cloneDeep, isString } from "@pureadmin/utils";
import QRCode from "qrcode";
import { computed, defineComponent, nextTick, ref, unref, watch } from "vue";
import "./index.scss";

const props = {
  // img 或者 canvas,img不支持logo嵌套
  tag: propTypes.string
    .validate(v => ["canvas", "img"].includes(v))
    .def("canvas"),
  // 二维码内容
  text: {
    type: [String, Array],
    default: null
  },
  // qrcode.js配置项
  options: {
    type: Object,
    default: () => ({})
  },
  // 宽度
  width: propTypes.number.def(200),
  // logo
  logo: {
    type: [String, Object],
    default: () => ""
  },
  // 是否过期
  disabled: propTypes.bool.def(false),
  // 过期提示内容
  disabledText: propTypes.string.def("")
};

export default defineComponent({
  name: "ReQrcode",
  props,
  emits: ["done", "click", "disabled-click"],
  setup(props, { emit }) {
    const { toCanvas, toDataURL } = QRCode;
    const loading = ref(true);
    const wrapRef = ref(null);
    const renderText = computed(() => String(props.text));
    const wrapStyle = computed(() => {
      return {
        width: props.width + "px",
        height: props.width + "px"
      };
    });
    const initQrcode = async () => {
      await nextTick();
      const options = cloneDeep(props.options || {});
      if (props.tag === "canvas") {
        // 容错率，默认对内容少的二维码采用高容错率，内容多的二维码采用低容错率
        options.errorCorrectionLevel =
          options.errorCorrectionLevel ||
          getErrorCorrectionLevel(unref(renderText));
        const _width = await getOriginWidth(unref(renderText), options);
        options.scale =
          props.width === 0 ? undefined : (props.width / _width) * 4;
        const canvasRef = await toCanvas(
          unref(wrapRef),
          unref(renderText),
          options
        );
        if (props.logo) {
          const url = await createLogoCode(canvasRef);
          emit("done", url);
          loading.value = false;
        } else {
          emit("done", canvasRef.toDataURL());
          loading.value = false;
        }
      } else {
        const url = await toDataURL(renderText.value, {
          errorCorrectionLevel: "H",
          width: props.width,
          ...options
        });
        unref(wrapRef).src = url;
        emit("done", url);
        loading.value = false;
      }
    };
    watch(
      () => renderText.value,
      val => {
        if (!val) return;
        initQrcode();
      },
      {
        deep: true,
        immediate: true
      }
    );
    const createLogoCode = canvasRef => {
      const canvasWidth = canvasRef.width;
      const logoOptions = Object.assign(
        {
          logoSize: 0.15,
          bgColor: "#ffffff",
          borderSize: 0.05,
          crossOrigin: "anonymous",
          borderRadius: 8,
          logoRadius: 0
        },
        isString(props.logo) ? {} : props.logo
      );
      const {
        logoSize = 0.15,
        bgColor = "#ffffff",
        borderSize = 0.05,
        crossOrigin = "anonymous",
        borderRadius = 8,
        logoRadius = 0
      } = logoOptions;
      const logoSrc = isString(props.logo) ? props.logo : props.logo.src;
      const logoWidth = canvasWidth * logoSize;
      const logoXY = (canvasWidth * (1 - logoSize)) / 2;
      const logoBgWidth = canvasWidth * (logoSize + borderSize);
      const logoBgXY = (canvasWidth * (1 - logoSize - borderSize)) / 2;
      const ctx = canvasRef.getContext("2d");
      if (!ctx) return;
      // logo 底色
      canvasRoundRect(ctx)(
        logoBgXY,
        logoBgXY,
        logoBgWidth,
        logoBgWidth,
        borderRadius
      );
      ctx.fillStyle = bgColor;
      ctx.fill();
      // logo
      const image = new Image();
      if (crossOrigin || logoRadius) {
        image.setAttribute("crossOrigin", crossOrigin);
      }
      image.src = logoSrc;
      // 使用image绘制可以避免某些跨域情况
      const drawLogoWithImage = image => {
        ctx.drawImage(image, logoXY, logoXY, logoWidth, logoWidth);
      };
      // 使用canvas绘制以获得更多的功能
      const drawLogoWithCanvas = image => {
        const canvasImage = document.createElement("canvas");
        canvasImage.width = logoXY + logoWidth;
        canvasImage.height = logoXY + logoWidth;
        const imageCanvas = canvasImage.getContext("2d");
        if (!imageCanvas || !ctx) return;
        imageCanvas.drawImage(image, logoXY, logoXY, logoWidth, logoWidth);
        canvasRoundRect(ctx)(logoXY, logoXY, logoWidth, logoWidth, logoRadius);
        if (!ctx) return;
        const fillStyle = ctx.createPattern(canvasImage, "no-repeat");
        if (fillStyle) {
          ctx.fillStyle = fillStyle;
          ctx.fill();
        }
      };
      // 将 logo绘制到 canvas上
      return new Promise(resolve => {
        image.onload = () => {
          logoRadius ? drawLogoWithCanvas(image) : drawLogoWithImage(image);
          resolve(canvasRef.toDataURL());
        };
      });
    };
    // 得到原QrCode的大小，以便缩放得到正确的QrCode大小
    const getOriginWidth = async (content, options) => {
      const _canvas = document.createElement("canvas");
      await toCanvas(_canvas, content, options);
      return _canvas.width;
    };
    // 对于内容少的QrCode，增大容错率
    const getErrorCorrectionLevel = content => {
      if (content.length > 36) {
        return "M";
      } else if (content.length > 16) {
        return "Q";
      } else {
        return "H";
      }
    };
    // 用于绘制圆角
    const canvasRoundRect = ctx => {
      return (x, y, w, h, r) => {
        const minSize = Math.min(w, h);
        if (r > minSize / 2) {
          r = minSize / 2;
        }
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
        return ctx;
      };
    };
    const clickCode = () => {
      emit("click");
    };
    const disabledClick = () => {
      emit("disabled-click");
    };
    return () => (
      <>
        <div
          v-loading={unref(loading)}
          class="qrcode relative inline-block"
          style={unref(wrapStyle)}
        >
          {props.tag === "canvas"
? (
            <canvas ref={wrapRef} onClick={clickCode}></canvas>
          )
: (
            <img ref={wrapRef} onClick={clickCode}></img>
          )}
          {props.disabled && (
            <div
              class="qrcode--disabled absolute top-0 left-0 flex w-full h-full items-center justify-center"
              onClick={disabledClick}
            >
              <div class="absolute top-[50%] left-[50%] font-bold">
                <iconify-icon-offline
                  class="cursor-pointer"
                  icon={RefreshRight}
                  width="30"
                  color="var(--el-color-primary)"
                />
                <div>{props.disabledText}</div>
              </div>
            </div>
          )}
        </div>
      </>
    );
  }
});
