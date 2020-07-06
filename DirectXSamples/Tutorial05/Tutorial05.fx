//--------------------------------------------------------------------------------------
// File: Tutorial05.fx
//
// Copyright (c) Microsoft Corporation. All rights reserved.
//--------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------
// Constant Buffer Variables
//--------------------------------------------------------------------------------------
cbuffer ConstantBuffer : register( b0 )
{
	matrix World;
	matrix View;
	matrix Projection;
	matrix matNormal;
}

cbuffer ConstantBufferPS : register(b1)
{
	float time;
	float3 vecEye;
	float useTexture;
	float bump;
}

/////////////
// GLOBALS //
/////////////
Texture2D shaderTexture : register(t0);
SamplerState SampleType;
Texture2D shaderNormalMap : register(t1);
Texture2D shaderSpecularMap : register(t2);

//--------------------------------------------------------------------------------------
struct VS_INPUT
{
    float4 Pos : POSITION;
    float4 Color : COLOR;
	float2 tex : TEXCOORD0;
	float3 Normal : NORMAL;
	float3 Tangent : TANGENT;
	float3 Binormal : BINORMAL;
};

struct PS_INPUT
{
    float4 Pos : SV_POSITION;
    float4 Color : COLOR;
	float4 WorldPos : COLOR1;
	float4 ObjectPos : COLOR2;
	float2 tex : TEXCOORD0;
	float3 Light : TEXCOORD1;
	float3 View : TEXCOORD2;
	float3 Normal : NORMAL;
	float3 Tangent : TANGENT;
	float3 Binormal : BINORMAL;
};


//--------------------------------------------------------------------------------------
// Vertex Shader
//--------------------------------------------------------------------------------------
PS_INPUT VS( VS_INPUT input )
{
	const float4 vecLightDir = float4( 0.0f, 1.0f, 1.0f, 0.0f);

	float4 worldPos;
	PS_INPUT output = (PS_INPUT)0;
    output.Pos = mul( input.Pos, World );
	worldPos = output.Pos;
    output.Pos = mul( output.Pos, View );
    output.Pos = mul( output.Pos, Projection );

	// ORIG:
	output.Color = input.Color;

	// V1
	//output.Color = worldPos;
	
	output.WorldPos = worldPos;
	output.ObjectPos = input.Pos;

	// Store the texture coordinates for the pixel shader.
	output.tex = input.tex;

	output.Light = vecLightDir; // -vecEye; // L
	output.View = vecEye - worldPos; // V
	
	//output.Norm = input.Normal; // N
	
	output.Normal = normalize(mul(input.Normal, matNormal));
	output.Tangent = input.Tangent;
	output.Binormal = input.Binormal;

	output.Tangent = mul(output.Tangent, World);
	output.Tangent = mul(output.Tangent, View);
	output.Tangent = normalize(output.Tangent);

	output.Binormal = mul(output.Binormal, World);
	output.Binormal = mul(output.Binormal, View);
	output.Binormal = normalize(output.Binormal);

    return output;
}


//--------------------------------------------------------------------------------------
// Pixel Shader
//--------------------------------------------------------------------------------------
float4 PS( PS_INPUT input) : SV_Target
{
	float4 outColor = input.Color;
	float frec = 10;
	// ORIG:
	//outColor = input.Color;

	// V1
	//outColor = length(input.WorldPos) / 1.732050808f;
	//outColor *= outColor;

	// V2
	//outColor = length(input.ObjectPos); // / 1.732050808f;
	//outColor *= outColor;
	//outColor = (0.75 + 0.25 * cos(frec * (outColor + time))); 
	//outColor = (0.6 + 0.4 * sin(frec * (input.ObjectPos.x + time))) * (0.6 + 0.4 * sin(frec*0.9 * (input.ObjectPos.y + time))) * (0.6 + 0.4 * sin(frec*0.7 * (input.ObjectPos.z + time)));


	// V3 Texture
	float4 textureColor = 0;
	float4 textNormal;
	
	// Sample the pixel color from the texture using the sampler at this texture coordinate location.
	if (useTexture > 0.5f)
	{
		textureColor = shaderTexture.Sample(SampleType, input.tex);
	}
	else
	{
		if (bump > 0.5f)
		{
			textureColor = float4 (1.0f, 0.8431f, 0.0745f, 0.0f); // oro
			//textureColor = float4 (0.5451f, 0.2706f, 0.0745f, 1.0f); // marron
		}
		else
		{
			textureColor.rgb = input.Color;
		}
	}

	//outColor.rgb = dot(normal,input.Norm); // textureColor * diff;

	//outColor = textureColor * outColor.x;

	//outColor = normal;

	//outColor = textureColor;


	//outColor.rgb = float3 ( 0, 0, normal.z );
	//outColor.rgb = (normal + 1) / 2;

	// invierte la luz para que la dirección sea desde la superficie hacia la fuente de luz.
	float3 LightDir = -normalize(input.Light);
	float3 normal = input.Normal;

	if ( bump > 0.5f )
	{
		// Clacula la normal a la superficie
		float3 normal0 = -normalize(cross(input.Tangent, input.Binormal));

		// obtiene la normal de la textura 
		textNormal = shaderNormalMap.Sample(SampleType, input.tex);
		textNormal = (2 * textNormal) - 1;
		
		// Convierte la normal del UV Space al WORLD SPACE.
		normal = textNormal.x * input.Tangent + textNormal.y * input.Binormal + textNormal.z * normal0;
		normal = normalize(normal);
	}
	else
	{ 
		float3 LightDir = -normalize(input.Light);
		float4 diff = saturate(dot(normal, LightDir));
	}

	/************** SPECULAR LIGHT ********/

	// calcula el coeficiente de luz difusa.
	float4 diff = saturate(dot(normal, LightDir));
	float3 diffColor = float3 (0.0f, 0.0f, 0.0f); // 1.0f;

	// Specular
	float3 VertexToEye = normalize(vecEye - input.WorldPos);
	float3 LightReflect = normalize(reflect(-LightDir, normal));

	float SpecularFactor = dot(VertexToEye, LightReflect);

	float4 SpecularColor = 0.0f;
	float gSpecularPower = 32.0f;
	float gMatSpecularIntensity;

	//gMatSpecularIntensity = shaderSpecularMap.Sample(SampleType, input.tex);
	gMatSpecularIntensity = 0.0f;

	// Para anular specular
	//SpecularFactor = 0.0f;

	if (SpecularFactor > 0.0f) {
		SpecularColor.rgb = float3(1.0f, 0.0f, 0.0f); // 0.5f;// float3 (1.0f, 1.0f, 1.0f);
		SpecularFactor = pow(SpecularFactor, gSpecularPower);
		SpecularColor = float4(SpecularColor.rgb * gMatSpecularIntensity * SpecularFactor, 1.0f);
	}

	/************** FINAL COLOR ********/

	outColor = (textureColor * diff) + SpecularColor;
	
	return outColor;
}

//--------------------------------------------------------------------------------------
// Vertex Shader for Wireframe
//--------------------------------------------------------------------------------------
PS_INPUT VS_WF(VS_INPUT input)
{
	float4 worldPos;
	PS_INPUT output = (PS_INPUT)0;
	output.Pos = mul(input.Pos, World);
	worldPos = output.Pos;
	output.Pos = mul(output.Pos, View);
	output.Pos = mul(output.Pos, Projection);

	// ORIG:
	output.Color = float4(1.0, 0.0, 1.0, 1.0);
	
	return output;
}

//--------------------------------------------------------------------------------------
// Pixel Shader for WireFrame
//--------------------------------------------------------------------------------------
float4 PS_WF(PS_INPUT input) : SV_Target
{
	float4 outColor = input.Color;
	return outColor;
}